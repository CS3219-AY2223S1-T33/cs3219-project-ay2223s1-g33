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

OUT_DIR="./generated"
ARGS=("$@")
PROTO_DIR=$1
OUTPUT_DIR=("${ARGS[@]:1}")

echo "Found the following files:";
FILES=`ls ${PROTO_DIR}/*.proto`;
echo $FILES

mkdir -p $OUT_DIR
protoc \
    --plugin=protoc-gen-ts="./node_modules/.bin/protoc-gen-ts" \
    --ts_out="${OUT_DIR}" \
    --ts_opt server_grpc1,client_grpc1,eslint_disable,long_type_number \
    --proto_path="${PROTO_DIR}" \
    $FILES

for P in ${OUTPUT_DIR[@]}; do
    echo ""
    echo "-- Emitting ${P} --"
    CFG_FILE=$P/proto-emit.cfg
    if [ -f "$CFG_FILE" ]; then
        EMIT_DIR=$(config_get $CFG_FILE emit_dir)
        EMIT_FILTER=$(config_get $CFG_FILE emit_filter)

        if [ ! -z "$EMIT_DIR" ]; then
            echo "Found valid proto-emit.cfg"
            CONFIG_OUT_DIR=$P/$EMIT_DIR
            mkdir -p $CONFIG_OUT_DIR
            if [ ! -z "$EMIT_FILTER" ]; then
                echo "Emitting filtered set to ${CONFIG_OUT_DIR}"
                FILTERS=(${EMIT_FILTER//,/ })
                for F in ${FILTERS[@]}; do
                    STUBS=(${F//./ })
                    find $OUT_DIR -name "${STUBS[0]}.ts" -exec cp {} "$CONFIG_OUT_DIR" \;
                    for i in "${!STUBS[@]}"; do 
                        if [ $i -eq 0 ]; then
                            continue
                        fi
                        find $OUT_DIR -name "${STUBS[0]}.grpc-${STUBS[$i]}.ts" -exec cp {} "$CONFIG_OUT_DIR" \;
                    done
                done
            else
                echo "Emitting all proto to ${CONFIG_OUT_DIR}"
                cp $OUT_DIR/*.ts $CONFIG_OUT_DIR
            fi
            continue
        fi
    fi
    echo "No config file found, emitting all"
    mkdir -p $P
    cp $OUT_DIR/*.ts $P
done

rm -r $OUT_DIR
