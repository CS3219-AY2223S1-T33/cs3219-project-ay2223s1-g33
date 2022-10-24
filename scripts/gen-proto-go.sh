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

echo "Generating Golang Proto files"
echo ""
echo "Found the following files:";
FILES=`ls ${PROTO_DIR}/*.proto`;
echo $FILES

mkdir -p $OUT_DIR
protoc --proto_path="${PROTO_DIR}" \
    --go_out="${OUT_DIR}" \
    --go_opt=paths=source_relative \
    --go-grpc_out="${OUT_DIR}" \
    --go-grpc_opt=paths=source_relative \
    proto/*.proto

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
            if [ ! -z "$EMIT_FILTER" ]; then
                echo "Emitting filtered set to ${CONFIG_OUT_DIR}"
                FILTERS=(${EMIT_FILTER//,/ })
                for F in ${FILTERS[@]}; do
                    STUBS=(${F//./ })
                    find $OUT_DIR -name "${STUBS[0]}.pb.go" -exec cp {} "$CONFIG_OUT_DIR" \;
                    for i in "${!STUBS[@]}"; do 
                        if [ $i -eq 0 ]; then
                            continue
                        fi
                        find $OUT_DIR -name "${STUBS[0]}_grpc.pb.go" -exec cp {} "$CONFIG_OUT_DIR" \;
                        break
                    done
                done
            else
                echo "Emitting all proto to ${CONFIG_OUT_DIR}"
                cp $OUT_DIR/*.go $CONFIG_OUT_DIR
            fi
            continue
        fi
    fi
    echo "No config file found, emitting all"
    mkdir -p $P
    cp $OUT_DIR/*.go $P
done

rm -r $OUT_DIR

