#!/bin/sh
#
# CSCA key
#
set -e # Exit immediately if a command exits with a non-zero status.

OPENSSL=${OPENSSL:=openssl}

${OPENSSL} ecparam -name prime256v1 -genkey -noout -out csca.key
${OPENSSL} req -x509 \
	-new \
	-subj '/CN=National CSCA of Neverland/C=NV/' \
	-key csca.key \
	-out csca.pem -nodes \
	-days 3650

# DSC keys
for i in 1 2 3 4 worker
do
R=$( ${OPENSSL} rand -hex 16 )
${OPENSSL} ecparam -name prime256v1 -genkey -noout -out dsc-$i.key
${OPENSSL} req -new \
	-subj "/CN=DSC number $i of Neverland/C=NV/" \
	-key dsc-$i.key -nodes | \
	\
${OPENSSL} x509 -req -CA csca.pem -CAkey csca.key -set_serial 0x$R \
	-days 1780  \
	-out dsc-$i.pem
done

cat dsc-*.pem > masterlist-dsc.pem

# JavaScripts prefers PKCS#8
openssl pkcs8 -in dsc-worker.key -nocrypt -topk8 -out dsc-worker.p8

# Remove unneeded keys and certs
# Uncomment the following line if you do not want to keep the private key files and the individual certs (.pem files)
# rm -f csca.key dsc-?.key dsc-?.pem 