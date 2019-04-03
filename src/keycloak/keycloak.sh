#!/bin/bash

. /etc/sysconfig/keycloak

# Detect DB vendor from default host names
if [ "${DB_VENDOR}" == "" ]; then
    if (getent hosts postgres &>/dev/null); then
        export DB_VENDOR="postgres"
    elif (getent hosts mysql &>/dev/null); then
        export DB_VENDOR="mysql"
    elif (getent hosts mariadb &>/dev/null); then
        export DB_VENDOR="mariadb"
    else
        export DB_VENDOR="h2"
    fi
else
    # Lower case DB_VENDOR
    DB_VENDOR=`echo $DB_VENDOR | tr A-Z a-z`
fi

# Set DB name
case "${DB_VENDOR}" in
    postgres)
        DB_NAME="PostgreSQL"
    ;;

    mysql)
        DB_NAME="MySQL"
    ;;

    mariadb)
        DB_NAME="MariaDB"
    ;;

    h2)
        DB_NAME="Embedded H2"
    ;;

    *)
        echo "Unknown DB vendor $DB_VENDOR"
        exit 1
    ;;
esac

# Append '?' in the beggining of the string if JDBC_PARAMS value isn't empty
export JDBC_PARAMS=$(echo ${JDBC_PARAMS} | sed '/^$/! s/^/?/')

if [ "${DB_VENDOR}" != "h2" ]; then
    /bin/sh /opt/jboss/tools/databases/change-database.sh ${DB_VENDOR}
fi

/opt/jboss/tools/x509.sh
/opt/jboss/tools/jgroups.sh ${JGROUPS_DISCOVERY_PROTOCOL} ${JGROUPS_DISCOVERY_PROPERTIES}
/opt/jboss/tools/autorun.sh

if [ ! -f "/opt/jboss/keycloak/standalone/data/admin.created" ]; then
    if [ ! -z "${KEYCLOAK_USER}" -a ! -z "${KEYCLOAK_PASSWORD}" ]; then
        if [ ! -f "/opt/jboss/keycloak/standalone/configuration/keycloak-add-user.json" ]; then
            /opt/jboss/keycloak/bin/add-user-keycloak.sh \
                --user ${KEYCLOAK_USER} \
                --password "${KEYCLOAK_PASSWORD}"

            touch /opt/jboss/keycloak/standalone/data/admin.created
        fi
    fi
fi

chown -R jboss:jboss /opt/jboss/keycloak/

ipa-client-install --mkhomedir --principal admin --password Welcome2KolabSystems --force-join --unattended || :

/opt/jboss/keycloak/bin/federation-sssd-setup.sh
