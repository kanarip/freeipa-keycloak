#!/bin/bash

. /etc/sysconfig/freeipa

/usr/sbin/ipa-client-install --mkhomedir --principal ${IPA_USER} --password ${IPA_PASSWORD} --force-join --unattended

exit $?
