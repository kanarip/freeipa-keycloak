# slow
#FROM registry.fedoraproject.org/fedora:30
FROM fedora:30

LABEL maintainer="Jeroen van Meeuwen (Kolab Systems) <vanmeeuwen@kolabsys.com>"

ENV container docker
ENV SYSTEMD_PAGER=''

RUN yum -y install \
        augeas \
        bind-utils \
        cyrus-imapd \
        cyrus-sasl \
        freeipa-client \
        lsof \
        openssl \
        net-tools \
        psmisc \
        strace \
        telnet \
        traceroute \
        vim-enhanced \
        wget && \
    yum clean all

RUN sed -r -i \
    -e 's|^configdirectory:.*$|configdirectory: /srv/imap/config/|g' \
    -e 's|^partition-default:.*$|partition-default: /srv/imap/spool/default/|g' \
    /etc/imapd.conf

RUN usermod -d /usr/libexec/cyrus-imapd cyrus
RUN rm -rf /var/lib/imap /var/spool/imap

ADD cyrus-imapd-init.sh /usr/local/sbin/cyrus-imapd-init.sh
RUN chmod u+x /usr/local/sbin/cyrus-imapd-init.sh

ARG IPA_PASSWORD=Welcome2KolabSystems
ARG IPA_REALM=example.local
ARG IPA_USER=admin

EXPOSE 443 993

ADD freeipa-join.service /etc/systemd/system/freeipa-join.service
RUN mkdir /etc/systemd/system/cyrus-imapd.service.d/
ADD ExecStartPre.conf /etc/systemd/system/cyrus-imapd.service.d/

RUN systemctl enable cyrus-imapd
RUN systemctl enable freeipa-join
RUN systemctl enable saslauthd


ENTRYPOINT [ "/lib/systemd/systemd" ]
