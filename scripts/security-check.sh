#!/usr/bin/env bash
# Revisión de seguridad local de SneakLab (sitio estático en docs/).
# Uso: bash scripts/security-check.sh   (desde la raíz del proyecto)
# No envía nada a internet ni modifica archivos. Sale con código 1 si algo falla.

cd "$(dirname "$0")/.." || exit 1
fail=0
ok()   { printf '  ok    %s\n' "$1"; }
bad()  { printf '  FALLA %s\n' "$1"; fail=1; }

echo "1. Secretos"
# Patrones de claves conocidas en archivos versionados y en todo el historial.
PATTERN='(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(password|passwd|secret|api[_-]?key|token)[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']{8,})'
if git grep -nIiE "$PATTERN" -- . ':!scripts/security-check.sh' >/dev/null; then bad "posible secreto en archivos versionados"; else ok "sin secretos en archivos versionados"; fi
if git log --all -p -- . ':!scripts/security-check.sh' | grep -qiE "$PATTERN"; then bad "posible secreto en el historial de Git"; else ok "sin secretos en el historial de Git"; fi
if git ls-files | grep -qE '(^|/)\.env$|\.pem$|\.key$|\.p12$|credentials.*\.json$'; then bad "archivo sensible versionado"; else ok "sin .env, llaves ni credenciales versionadas"; fi
git check-ignore -q .env && ok ".env está en .gitignore" || bad ".env no está en .gitignore"

echo "2. Código del navegador (docs/)"
# (se ignoran las líneas de comentario)
if grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' docs --include=*.js --include=*.html | grep -vE '^[^:]+:[0-9]+:[[:space:]]*(\*|//)' >/dev/null; then bad "API peligrosa para XSS en docs/"; else ok "sin innerHTML, eval ni document.write"; fi
if grep -rnE ' on(click|load|error|mouseover|submit|change|input)=' docs --include=*.html >/dev/null; then bad "manejadores en línea (on...=) en HTML"; else ok "sin manejadores de eventos en línea"; fi
if grep -rnoE '<script(\s[^>]*)?>' docs --include=*.html | grep -vE 'src="assets/js/|type="application/ld\+json"' >/dev/null; then bad "script en línea ejecutable"; else ok "solo scripts propios y JSON-LD"; fi
if grep -rnE 'style="' docs --include=*.html >/dev/null; then bad "estilos en línea (los bloquea la CSP)"; else ok "sin estilos en línea"; fi

echo "3. Content Security Policy"
n=$(grep -ho 'http-equiv="Content-Security-Policy" content="[^"]*"' docs/*.html | sort -u | wc -l | tr -d ' ')
pages=$(ls docs/*.html | wc -l | tr -d ' ')
with=$(grep -l 'http-equiv="Content-Security-Policy"' docs/*.html | wc -l | tr -d ' ')
[ "$with" = "$pages" ] && ok "las $pages páginas tienen CSP" || bad "solo $with de $pages páginas tienen CSP"
[ "$n" = "1" ] && ok "la CSP es idéntica en todas" || bad "hay $n versiones distintas de la CSP"
if grep -hoE "Content-Security-Policy\" content=\"[^\"]*" docs/*.html | grep -qE "unsafe-inline|unsafe-eval|\*;|https?:"; then bad "la CSP permite orígenes externos o unsafe-*"; else ok "CSP solo 'self', sin unsafe-*"; fi

echo "4. Enlaces y recursos externos"
if grep -rnoE '<a [^>]*target="_blank"[^>]*>' docs --include=*.html | grep -v noopener >/dev/null; then bad "target=_blank sin noopener"; else ok "target=_blank siempre con noopener"; fi
if grep -rnE '(src|href)="http://' docs --include=*.html >/dev/null; then bad "recurso por http://"; else ok "sin recursos por http://"; fi
if grep -rnoE '(src|href)="https?://[^"]+"' docs --include=*.html | grep -vE 'danyalba03-spec\.github\.io|schema\.org' >/dev/null; then bad "recurso de un dominio externo no esperado"; else ok "sin recursos de terceros"; fi

echo "5. Archivos publicados"
if find docs -type f \( -name '.env*' -o -name '*.bak' -o -name '*.sql' -o -name '*.db' -o -name '*.zip' -o -name '*.py' -o -name '.DS_Store' \) | grep -q .; then bad "archivo privado o de respaldo dentro de docs/"; else ok "docs/ solo tiene archivos del sitio"; fi
if python3 - <<'EOF'
import glob, sys
from PIL import Image
bad = [f for f in glob.glob('docs/assets/img/*') if not f.endswith('.svg') and (len(Image.open(f).getexif()) or 'xmp' in Image.open(f).info)]
sys.exit(1 if bad else 0)
EOF
then ok "imágenes sin metadatos EXIF/GPS"; else bad "imágenes con metadatos (o falta Pillow)"; fi

echo
[ $fail = 0 ] && echo "Resultado: todas las comprobaciones pasaron." || echo "Resultado: hay comprobaciones que fallaron."
exit $fail
