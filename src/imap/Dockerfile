# slow
#FROM registry.fedoraproject.org/fedora:30
FROM fedora:30

LABEL maintainer="Jeroen van Meeuwen (Kolab Systems) <vanmeeuwen@kolabsys.com>"

ENV container docker
ENV SYSTEMD_PAGER=''

RUN echo "zchunk=False" >> /etc/dnf/dnf.conf
RUN dnf -y update librepo && \
    dnf clean all

RUN dnf -y install \
        augeas \
        bind-utils \
        cyrus-imapd \
        cyrus-sasl \
        cyrus-sasl-plain \
        freeipa-client \
        iproute \
        iputils \
        jq \
        lsof \
        openssl \
        net-tools \
        psmisc \
        python3-jwt \
        strace \
        telnet \
        traceroute \
        vim-enhanced \
        wget && \
    dnf clean all

RUN sed -r -i \
    -e 's|^configdirectory:.*$|configdirectory: /data/imap/config/|g' \
    -e 's|^partition-default:.*$|partition-default: /data/imap/spool/default/|g' \
    -e 's|^sievedir:.*$|sievedir: /data/imap/config/sieve|g' \
    -e 's|^allowplaintext:.*$|allowplaintext: no|g' \
    /etc/imapd.conf && \
    echo "debug: 1" >> /etc/imapd.conf && \
    echo "chatty: 1" >> /etc/imapd.conf

RUN usermod -d /usr/libexec/cyrus-imapd cyrus
RUN rm -rf /var/lib/imap /var/spool/imap

ADD cyrus-imapd-init.sh /usr/local/sbin/cyrus-imapd-init.sh
RUN chmod 750 /usr/local/sbin/cyrus-imapd-init.sh

ARG IPA_PASSWORD=Welcome2KolabSystems
ARG IPA_USER=admin

EXPOSE 443 993

ADD freeipa-join.service /etc/systemd/system/freeipa-join.service
ADD freeipa-join.sh /usr/local/sbin/freeipa-join.sh
RUN chmod 750 /usr/local/sbin/freeipa-join.sh

ADD kolab-saslauthd.service /etc/systemd/system/kolab-saslauthd.service
ADD kolab-saslauthd.py /usr/local/sbin/kolab-saslauthd
RUN chmod 750 /usr/local/sbin/kolab-saslauthd

RUN mkdir /etc/systemd/system/cyrus-imapd.service.d/
ADD ExecStartPre.conf /etc/systemd/system/cyrus-imapd.service.d/

RUN echo "IPA_PASSWORD=$IPA_PASSWORD" >> /etc/sysconfig/freeipa
RUN echo "IPA_USER=$IPA_USER" >> /etc/sysconfig/freeipa

RUN systemctl enable cyrus-imapd
RUN systemctl enable freeipa-join
RUN systemctl enable kolab-saslauthd

# RUN systemctl enable saslauthd

RUN ln -sf /bin/true /usr/libexec/hostname/nis-domainname

ENTRYPOINT [ "/lib/systemd/systemd" ]
