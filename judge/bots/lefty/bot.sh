# Versión Python del script de ejecución.

dir=$(realpath --relative-to=`pwd` "$(dirname "$0")")
pyscript=LeftyBot  

usage() {
  echo "$0 (build|exec)" 
}

# Compilar el bot
build() {
  ulimit 262144
  python2 -m py_compile $dir/*.py
}

# Ejecutar el bot
execute() {
  CONTAINER=$(docker create --rm -a stdin -a stdout -i --memory 300M python:2.7-alpine3.7 python $pyscript.pyc)
  docker cp $dir/ $CONTAINER:/
  docker start --attach --interactive $CONTAINER
}

if [ $# -ne 1 ]
then
  usage
else
  case "$1" in
  "exec")
    execute
  ;;
  "build")
    build
  ;;
  *)
    usage
  ;;
  esac
fi