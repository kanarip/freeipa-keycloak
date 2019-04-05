#!/usr/bin/python3
# Copyright 2010-2016 Kolab Systems AG (http://www.kolabsys.com)
#
# Jeroen van Meeuwen (Kolab Systems) <vanmeeuwen a kolabsys.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

"""
    SASL authentication daemon for multi-domain Kolab deployments.

    The SASL authentication daemon can use the domain name space or realm
    in the login credentials to determine the backend authentication
    database, and authenticate the credentials supplied against that
    backend.
"""

from argparse import ArgumentParser

import grp
import json
import jwt
import os
import pwd
import requests
import sys
import time
import traceback


class SASLAuthDaemon:
    def __init__(self):
        self.cli_parser = ArgumentParser()

        daemon_group = self.cli_parser.add_argument_group("Daemon Options")

        daemon_group.add_argument(
            "-s",
            "--socket",
            dest="socketfile",
            action="store",
            default="/var/run/saslauthd/mux",
            help="Socket file to bind to."
        )

        daemon_group.add_argument(
            "-u",
            "--user",
            dest="process_username",
            action="store",
            default="cyrus",
            help="Run as user USERNAME",
            metavar="USERNAME"
        )

        daemon_group.add_argument(
            "-g",
            "--group",
            dest="process_groupname",
            action="store",
            default="mail",
            help="Run as group GROUPNAME",
            metavar="GROUPNAME"
        )

        self.cli_keywords = self.cli_parser.parse_args()

        self.thread_count = 0

    def run(self):
        """
            Run the SASL authentication daemon.
        """

        exitcode = 0

        if not os.path.isdir(os.path.dirname(self.cli_keywords.socketfile)):
            os.makedirs(os.path.dirname(self.cli_keywords.socketfile))

        (
            user_name,
            user_password,
            user_uid,
            user_gid,
            user_gecos,
            user_homedir,
            user_shell
        ) = pwd.getpwnam(self.cli_keywords.process_username)

        os.chown(os.path.dirname(self.cli_keywords.socketfile), user_uid, -1)

        self._drop_privileges()

        self.thread_count += 1
        self.do_saslauthd()

        sys.exit(1)

    def do_saslauthd(self):
        """
            Create the actual listener socket, and handle the authentication.

            The actual authentication handling is passed on to the appropriate
            backend authentication classes through the more generic Auth().
        """
        import socket
        import struct

        s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

        # TODO: The saslauthd socket path could be a setting.
        try:
            os.remove(self.cli_keywords.socketfile)
        except:  # noqa
            # TODO: Do the "could not remove, could not start" dance
            pass

        s.bind(self.cli_keywords.socketfile)
        os.chmod(self.cli_keywords.socketfile, 0o777)

        s.listen(5)

        while 1:
            max_tries = 20
            cur_tries = 0
            bound = False
            while not bound:
                cur_tries += 1
                try:
                    (clientsocket, address) = s.accept()
                    bound = True
                except Exception as errmsg:
                    print("kolab-saslauthd could not accept connections on socket: %r" % (errmsg))

                    if cur_tries >= max_tries:
                        print("Maximum tries exceeded, exiting")
                        sys.exit(1)

                    time.sleep(1)

            received = clientsocket.recv(4096)

            login = []

            start = 0
            end = 2

            while end < len(received):
                (length,) = struct.unpack("!H", received[start:end])
                start += 2
                end += length
                (value,) = struct.unpack("!%ds" % (length), received[start:end])
                start += length
                end = start + 2
                login.append(value)

            realm = False
            success = False

            if len(login) == 4:
                (username, password, service, realm) = [x.decode() for x in login]
            elif len(login) == 3:
                (username, password, service) = [x.decode() for x in login]

                if len(username.split('@')) == 2:
                    realm = username.split('@')[1]

            if not realm:
                realm = socket.getfqdn().split('.', 1)[1]

            try:
                access_token = password

                # obtain from http://keycloak.example.local:8080/auth/realms/master/

                request = requests.get('http://keycloak.example.local:8080/auth/realms/%s/' % (realm))

                public_key = "-----BEGIN PUBLIC KEY-----\n"
                public_key += request.json()['public_key']
                public_key += "\n-----END PUBLIC KEY-----"

                access_token_json = jwt.decode(access_token, public_key, audience='account')

                success = True
            except:
                import traceback
                traceback.print_exc()

            if success:
                # #1170: Catch broken pipe error (incomplete authentication request)
                clientsocket.send(struct.pack("!H2s", 2, b"OK"))
            else:
                # #1170: Catch broken pipe error (incomplete authentication request)
                clientsocket.send(struct.pack("!H2s", 2, b"NO"))

            clientsocket.close()

    def _drop_privileges(self):
        try:
            try:
                (ruid, euid, suid) = os.getresuid()
                (rgid, egid, sgid) = os.getresgid()
            except AttributeError:
                ruid = os.getuid()
                rgid = os.getgid()

            if ruid == 0:
                # Means we can setreuid() / setregid() / setgroups()
                if rgid == 0:
                    # Get group entry details
                    try:
                        (
                            group_name,
                            group_password,
                            group_gid,
                            group_members
                        ) = grp.getgrnam(self.cli_keywords.process_groupname)

                    except KeyError:
                        print("Group %s does not exist" % (self.cli_keywords.process_groupname))

                        sys.exit(1)

                    # Set real and effective group if not the same as current.
                    if not group_gid == rgid:
                        print(
                            "Switching real and effective group id to %d" % (
                                group_gid
                            )
                        )

                        os.setregid(group_gid, group_gid)

                if ruid == 0:
                    # Means we haven't switched yet.
                    try:
                        (
                            user_name,
                            user_password,
                            user_uid,
                            user_gid,
                            user_gecos,
                            user_homedir,
                            user_shell
                        ) = pwd.getpwnam(self.cli_keywords.process_username)

                    except KeyError:
                        print("User %s does not exist" % (self.cli_keyowrds.process_username))

                        sys.exit(1)

                    # Set real and effective user if not the same as current.
                    if not user_uid == ruid:
                        print("Switching real and effective user id to %d" % (user_uid))

                        os.setreuid(user_uid, user_uid)

        except:  # noqa
            print("Could not change real and effective uid and/or gid")


if __name__ == "__main__":
    saslauthd = SASLAuthDaemon()
    saslauthd.run()
