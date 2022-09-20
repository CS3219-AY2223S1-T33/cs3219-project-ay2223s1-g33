#!/bin/bash

config_read_file() {
    (grep -E "^${2}=" -m 1 "${1}" 2>/dev/null || echo "VAR=__UNDEFINED__") | head -n 1 | cut -d '=' -f 2-;
}

config_get() {
    val="$(config_read_file ${1} "${2}")";
    if [ "${val}" = "__UNDEFINED__" ]; then
        val="";
    fi
    printf -- "%s" "${val}";
}

echo "Generating Gateway Files"
PROTO_DIR=$1
GATEWAY_DIR=$2

CFG_FILE=$GATEWAY_DIR/proto-emit.cfg
EMIT_FILTERS=$(config_get ${CFG_FILE} emit_gateway)
EMIT_DIR=$(config_get ${CFG_FILE} emit_gateway_dir)
GEN_DIR=$GATEWAY_DIR/$EMIT_DIR
if [ -z "$EMIT_FILTERS" ]; then
    echo "No gateway config"
    exit 2
fi

FILTERS=(${EMIT_FILTERS//,/ })
FILES=""

for F in ${FILTERS[@]}; do
    FF=`find $PROTO_DIR -name "${F}.proto"`
    FILES="$FILES $FF"
done

echo "Processing:"
echo $FILES
echo ""

protoc --proto_path=proto --grpc-gateway_out $GEN_DIR --grpc-gateway_opt logtostderr=true \
    --grpc-gateway_opt paths=source_relative --grpc-gateway_opt generate_unbound_methods=true \
    --grpc-gateway_opt grpc_api_configuration=$GATEWAY_DIR/service_definitions.yaml \
    $FILES

echo "DONE"
