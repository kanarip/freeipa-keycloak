FROM freeipa/freeipa-server:latest

RUN sed -r -i \
    -e 's/^pki_random_serial_numbers_enable.*$/pki_random_serial_numbers_enable=True/g' \
    /usr/share/pki/server/etc/default.cfg
