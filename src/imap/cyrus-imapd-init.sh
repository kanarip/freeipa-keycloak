#!/bin/bash

mkdir -p /data/imap/config/
mkdir -p /data/imap/partition/default/

chown -R cyrus:mail /data/imap/config/
chown -R cyrus:mail /data/imap/partition/default/

chown -R cyrus /etc/pki/cyrus-imapd

su -s /bin/bash - cyrus -c '/usr/libexec/cyrus-imapd/mkimap'

cd /data/imap/

TZ_VERSION=2019a
TZ_TAR="tzdata${TZ_VERSION}.tar.gz"
TZ_URL="https://data.iana.org/time-zones/releases/${TZ_TAR}"

if [ ! -f "${TZ_TAR}" ]; then
    wget ${TZ_URL}
fi

if [ ! -d /data/imap/tzdata${TZ_VERSION}/ ]; then
    mkdir -p /data/imap/tzdata${TZ_VERSION}/
fi

cd /data/imap/tzdata${TZ_VERSION}/
tar zxvf /data/imap/${TZ_TAR}

sed -r -i -e 's/^(Rule\s+Japan\s*1948\s+1951\s+.*\s*)\s25:00(.*)$/\1 24:00\2/g' asia

su -s /bin/bash - cyrus -c "/usr/libexec/cyrus-imapd/vzic --pure --olson-dir /data/imap/tzdata${TZ_VERSION}/ --output-dir /data/imap/config/zoneinfo"

su -s /bin/bash - cyrus -c "/usr/sbin/ctl_zoneinfo -r iana:${TZ_VERSION}"
