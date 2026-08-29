#!/usr/bin/env sh
set -eu

repository='v-aranda/Artifice'
base_url="https://github.com/${repository}/releases/latest/download"
architecture="$(uname -m)"

case "$architecture" in
  x86_64|amd64) archive='artifice-linux-x64.tar.gz' ;;
  *) echo "Arquitetura Linux não suportada: $architecture. Veja as releases em https://github.com/${repository}/releases" >&2; exit 1 ;;
esac

command -v curl >/dev/null 2>&1 || { echo 'curl é necessário para instalar o Artifice.' >&2; exit 1; }
command -v sha256sum >/dev/null 2>&1 || { echo 'sha256sum é necessário para validar o download.' >&2; exit 1; }

temporary_directory="$(mktemp -d)"
trap 'rm -rf "$temporary_directory"' EXIT INT HUP TERM
curl -fsSL "${base_url}/${archive}" -o "${temporary_directory}/${archive}"
curl -fsSL "${base_url}/checksums.txt" -o "${temporary_directory}/checksums.txt"
(cd "$temporary_directory" && grep "  ${archive}$" checksums.txt | sha256sum -c -)

install_directory="${HOME}/.local/bin"
mkdir -p "$install_directory"
tar -xzf "${temporary_directory}/${archive}" -C "$temporary_directory"
install -m 755 "${temporary_directory}/artifice" "${install_directory}/artifice"
echo "Artifice instalado em ${install_directory}/artifice"

case ":${PATH}:" in
  *":${install_directory}:"*) ;;
  *) echo "Adicione ${install_directory} ao PATH e abra um novo terminal." ;;
esac
