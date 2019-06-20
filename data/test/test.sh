#!/bin/bash

. /etc/sysconfig/freeipa

(
    sleep 1;
    echo "${IPA_PASSWORD}"
) | kinit admin@EXAMPLE.LOCAL

declare -a users


users[${#users[@]}]="John Doe"
users[${#users[@]}]="Joe Sixpack"
users[${#users[@]}]="Liutauras Adomaitis"
users[${#users[@]}]="Michael Bohlender"
users[${#users[@]}]="Lioba Leickel"
users[${#users[@]}]="Aleksander Machniak"
users[${#users[@]}]="Jeroen van Meeuwen"
users[${#users[@]}]="Christian Mollekopf"
users[${#users[@]}]="Mads Petersen"
users[${#users[@]}]="Nanita Winniewski"

x=0
while [ ${x} -lt ${#users[@]} ]; do
    echo ${users[${x}]} | while read givenname sn; do
        (
            sleep 1;
            echo "${IPA_PASSWORD}"
        ) | ipa user-add $(echo ${sn} | tr -d ' ') --first="${givenname}" --last="${sn}" --cn="${givenname} ${sn}" --password
    done

    let x++
done
