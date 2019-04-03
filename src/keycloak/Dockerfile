FROM centos/systemd

LABEL maintainer="vanmeeuwen@kolabsys.com"

ENV container docker
ENV SYSTEMD_PAGER=''

# This should really be a part of the base image.
RUN rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7

# To speed things up, disable fastestmirror.
RUN sed -r -i \
        -e 's/^enabled.*$/enabled = 0/g' \
        /etc/yum/pluginconf.d/fastestmirror.conf

# # Avoid using a mirrorlist (use a transparent proxy and cache everything instead).
# RUN sed -r -i \
#         -e 's/^mirrorlist/#mirrorlist/g' \
#         -e 's/^#baseurl/baseurl/g' \
#         /etc/yum.repos.d/*.repo

RUN sed -i -e '/tsflags=nodocs/d' /etc/yum.conf

# Add EPEL.
RUN yum clean all && \
    yum -y install \
        epel-release && \
    yum clean all

# Add the EPEL key.
RUN rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7

# Install troubleshooting utilities
RUN yum -y install \
        augeas \
        bind-utils \
        bsdtar \
        bzip2 \
        cyrus-imapd \
        cyrus-sasl-plain \
        firefox \
        freeipa-client \
        git \
        iproute \
        java-1.8.0-openjdk-devel \
        jna \
        jq \
        krb5-workstation \
        lsof \
        net-tools \
        nmap-ncat \
        openldap-clients \
        openssh-server \
        openssl \
        psmisc \
        python34-pip \
        saxon \
        sssd-dbus \
        sssd-tools \
        strace \
        telnet \
        traceroute \
        unzip \
        vim-enhanced \
        wget \
        which \
        xmlstarlet && \
    yum clean all

RUN yum -y install https://github.com/keycloak/libunix-dbus-java/releases/download/libunix-dbus-java-0.8.0/libunix-dbus-java-0.8.0-1.fc24.x86_64.rpm

CMD ["/lib/systemd/systemd"]

RUN groupadd -r -g 1000 jboss && \
    useradd -u 1000 -r -g jboss -m -d /opt/jboss -s /sbin/nologin -c "JBoss user" jboss && \
    chmod 755 /opt/jboss

WORKDIR /opt/jboss

ADD jboss-keycloak.git/server/tools /opt/jboss/tools

ENV JAVA_HOME /usr/lib/jvm/java

ENV KEYCLOAK_VERSION 5.0.0
ENV JDBC_POSTGRES_VERSION 42.2.5
ENV JDBC_MYSQL_VERSION 5.1.46
ENV JDBC_MARIADB_VERSION 2.2.3

ENV LAUNCH_JBOSS_IN_BACKGROUND 1
ENV PROXY_ADDRESS_FORWARDING false
ENV JBOSS_HOME /opt/jboss/keycloak
ENV LANG en_US.UTF-8

ARG DB_DATABASE=keycloak
ARG DB_PASSWORD=password
ARG DB_USER=keycloak

ARG GIT_REPO
ARG GIT_BRANCH
ARG KEYCLOAK_DIST=https://downloads.jboss.org/keycloak/$KEYCLOAK_VERSION/keycloak-$KEYCLOAK_VERSION.tar.gz

RUN /opt/jboss/tools/build-keycloak.sh

RUN echo "DB_ADDR=postgres" > /etc/sysconfig/keycloak
RUN echo "DB_DATABASE=$DB_DATABASE" >> /etc/sysconfig/keycloak
RUN echo "DB_PASSWORD=$DB_PASSWORD" >> /etc/sysconfig/keycloak
RUN echo "DB_USER=$DB_USER" >> /etc/sysconfig/keycloak
RUN echo "DB_VENDOR=POSTGRES" >> /etc/sysconfig/keycloak

ADD keycloak.sh /opt/jboss/keycloak/bin/keycloak.sh
ADD keycloak.service /etc/systemd/system/keycloak.service
RUN systemctl enable keycloak.service
