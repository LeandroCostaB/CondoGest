#!/usr/bin/env bash
# CondoGest Backend - Bateria de Testes HTTP
# Uso: bash test-api.sh

set -uo pipefail

CORE_URL="http://localhost:4001/v1"
TICKET_URL="http://localhost:4002/v1"

# Apartment snapshot existente no ticket-service (necessário para criar tickets)
APARTMENT_SNAPSHOT_ID="57737ce7-af82-4d08-8eb2-6bff3d8da88f"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0

check() {
    local n=$1 name=$2 expected=$3 actual=$4 body=${5:-}
    if [ "$actual" -eq "$expected" ]; then
        echo -e "${GREEN}✓ PASS${NC} [$(printf '%02d' "$n")] $name"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} [$(printf '%02d' "$n")] $name"
        echo -e "     Expected HTTP ${expected}, got HTTP ${YELLOW}${actual}${NC}"
        [ -n "$body" ] && echo -e "     Body: $(echo "$body" | head -c 300)"
        ((FAIL++))
        return 1
    fi
}

skip() { echo -e "${YELLOW}⚠ SKIP${NC} [$(printf '%02d' "$1")] $2"; ((SKIP++)); }

req() {
    local method=$1 url=$2; shift 2
    local args=()
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -H) args+=(-H "$2"); shift 2;;
            -d) args+=(-d "$2"); shift 2;;
            *) shift;;
        esac
    done
    local raw
    raw=$(curl -s -w "\n%{http_code}" --max-time 10 -X "$method" "$url" "${args[@]}" 2>/dev/null)
    STATUS=$(echo "$raw" | tail -1)
    BODY=$(echo "$raw" | head -n -1)
}

jf() {
    echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$2',''))" 2>/dev/null || echo ""
}

jlist() {
    echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['$2'])" 2>/dev/null || echo ""
}

echo -e "\n${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║      CondoGest Backend — Bateria de Testes       ║${NC}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}\n"

# ── Health check ──────────────────────────────────────────
echo -e "${BOLD}▶ Verificando serviços...${NC}"
CORE_OK=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$CORE_URL/../docs" 2>/dev/null || echo "000")
TICKET_OK=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$TICKET_URL/../docs" 2>/dev/null || echo "000")
[ "$CORE_OK"   = "000" ] && echo -e "${RED}✗ core-service não responde em :4001${NC}" && exit 1
[ "$TICKET_OK" = "000" ] && echo -e "${RED}✗ ticket-service não responde em :4002${NC}" && exit 1
echo -e "${GREEN}✓ core-service (:4001)${NC}  ${GREEN}✓ ticket-service (:4002)${NC}\n"

# ── 1-5: Auth ─────────────────────────────────────────────
echo -e "${BOLD}── Auth (core-service :4001) ────────────────────────${NC}"

# 01
req POST "$CORE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"sindico@condogest.com","senha":"senha123"}'
check 1 "POST /auth/login (credenciais válidas)" 200 "$STATUS" "$BODY"
JWT=$(jf "$BODY" "access_token")
[ -z "$JWT" ] && echo -e "${RED}ERRO CRÍTICO: JWT não extraído. Abortando.${NC}" && exit 1

# 02
req GET "$CORE_URL/auth/me" -H "Authorization: Bearer $JWT"
check 2 "GET /auth/me (com JWT)" 200 "$STATUS" "$BODY"

# 03
TS=$(date +%s)
req POST "$CORE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT" \
    -d "{\"nome\":\"Teste $TS\",\"email\":\"teste_${TS}@test.com\",\"senha\":\"senha123\"}"
check 3 "POST /auth/register (novo usuário → 201)" 201 "$STATUS" "$BODY"

# 04
req POST "$CORE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"sindico@condogest.com","senha":"senhaerrada"}'
check 4 "POST /auth/login (senha errada → 401)" 401 "$STATUS" "$BODY"

# 05
req GET "$CORE_URL/auth/me"
check 5 "GET /auth/me (sem token → 401)" 401 "$STATUS" "$BODY"

# ── 6-11: Condominiums ────────────────────────────────────
echo -e "\n${BOLD}── Condominiums (core-service :4001) ────────────────${NC}"

CONDO_ID=""
CONDO_NAME="Cond. API Test $TS"

# 06
req POST "$CORE_URL/condominiums" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT" \
    -d "{\"name\":\"$CONDO_NAME\",\"address\":\"Rua Teste, 123 - São Paulo/SP\"}"
check 6 "POST /condominiums (criar → 201)" 201 "$STATUS" "$BODY"

# 07
req GET "$CORE_URL/condominiums" -H "Authorization: Bearer $JWT"
check 7 "GET /condominiums (listar → 200)" 200 "$STATUS" "$BODY"
CONDO_ID=$(echo "$BODY" | python3 -c "
import sys,json
d=json.load(sys.stdin)
m=[x['id'] for x in d['data'] if x.get('name')=='$CONDO_NAME']
print(m[0] if m else '')
" 2>/dev/null || echo "")

# 08
if [ -n "$CONDO_ID" ]; then
    req GET "$CORE_URL/condominiums/$CONDO_ID" -H "Authorization: Bearer $JWT"
    check 8 "GET /condominiums/:id" 200 "$STATUS" "$BODY"
else skip 8 "GET /condominiums/:id (sem ID)"; fi

# 09
if [ -n "$CONDO_ID" ]; then
    req PUT "$CORE_URL/condominiums/$CONDO_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT" \
        -d '{"name":"Cond. API Test Atualizado","address":"Rua Teste, 456 - São Paulo/SP"}'
    check 9 "PUT /condominiums/:id (atualizar)" 200 "$STATUS" "$BODY"
else skip 9 "PUT /condominiums/:id"; fi

# 10
if [ -n "$CONDO_ID" ]; then
    req PATCH "$CORE_URL/condominiums/$CONDO_ID/deactivate" -H "Authorization: Bearer $JWT"
    check 10 "PATCH /condominiums/:id/deactivate" 204 "$STATUS" ""
else skip 10 "PATCH .../deactivate"; fi

# 11
if [ -n "$CONDO_ID" ]; then
    req PATCH "$CORE_URL/condominiums/$CONDO_ID/activate" -H "Authorization: Bearer $JWT"
    check 11 "PATCH /condominiums/:id/activate" 204 "$STATUS" ""
else skip 11 "PATCH .../activate"; fi

# ── 12-17: Apartments ─────────────────────────────────────
echo -e "\n${BOLD}── Apartments (core-service :4001) ──────────────────${NC}"

APT_ID=""

# 12
if [ -n "$CONDO_ID" ]; then
    req POST "$CORE_URL/condominiums/$CONDO_ID/apartments" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT" \
        -d '{"number":"101","block":"A","floor":1}'
    check 12 "POST .../apartments (criar → 201)" 201 "$STATUS" "$BODY"
else skip 12 "POST .../apartments"; fi

# 13
if [ -n "$CONDO_ID" ]; then
    req GET "$CORE_URL/condominiums/$CONDO_ID/apartments" -H "Authorization: Bearer $JWT"
    check 13 "GET .../apartments (listar)" 200 "$STATUS" "$BODY"
    APT_ID=$(jlist "$BODY" "id")
else skip 13 "GET .../apartments"; fi

# 14
if [ -n "$CONDO_ID" ] && [ -n "$APT_ID" ]; then
    req GET "$CORE_URL/condominiums/$CONDO_ID/apartments/$APT_ID" -H "Authorization: Bearer $JWT"
    check 14 "GET .../apartments/:aptId" 200 "$STATUS" "$BODY"
else skip 14 "GET .../apartments/:aptId"; fi

# 15
if [ -n "$CONDO_ID" ] && [ -n "$APT_ID" ]; then
    req PUT "$CORE_URL/condominiums/$CONDO_ID/apartments/$APT_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT" \
        -d '{"number":"101","block":"A","floor":2}'
    check 15 "PUT .../apartments/:aptId (atualizar)" 200 "$STATUS" "$BODY"
else skip 15 "PUT .../apartments/:aptId"; fi

# 16
if [ -n "$CONDO_ID" ] && [ -n "$APT_ID" ]; then
    req DELETE "$CORE_URL/condominiums/$CONDO_ID/apartments/$APT_ID" -H "Authorization: Bearer $JWT"
    check 16 "DELETE .../apartments/:aptId" 204 "$STATUS" ""
else skip 16 "DELETE .../apartments/:aptId"; fi

# 17
if [ -n "$CONDO_ID" ]; then
    req DELETE "$CORE_URL/condominiums/$CONDO_ID" -H "Authorization: Bearer $JWT"
    check 17 "DELETE /condominiums/:id (cleanup)" 204 "$STATUS" ""
else skip 17 "DELETE /condominiums/:id"; fi

# ── 18-21: Providers ─────────────────────────────────────
echo -e "\n${BOLD}── Providers (ticket-service :4002) ─────────────────${NC}"

PROVIDER_ID=""

# 18
req POST "$TICKET_URL/providers" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT" \
    -d '{"name":"Encanamentos Teste Ltda","phone":"(11) 98888-0001","specialty":"PLUMBER"}'
check 18 "POST /providers (criar → 201)" 201 "$STATUS" "$BODY"
PROVIDER_ID=$(jf "$BODY" "id")

# 19
req GET "$TICKET_URL/providers" -H "Authorization: Bearer $JWT"
check 19 "GET /providers (listar)" 200 "$STATUS" "$BODY"

# 20
if [ -n "$PROVIDER_ID" ]; then
    req GET "$TICKET_URL/providers/$PROVIDER_ID" -H "Authorization: Bearer $JWT"
    check 20 "GET /providers/:id" 200 "$STATUS" "$BODY"
else skip 20 "GET /providers/:id"; fi

# 21
if [ -n "$PROVIDER_ID" ]; then
    req PUT "$TICKET_URL/providers/$PROVIDER_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT" \
        -d '{"name":"Encanamentos Atualizado","phone":"(11) 99999-0001","specialty":"PLUMBER"}'
    check 21 "PUT /providers/:id (atualizar)" 200 "$STATUS" "$BODY"
else skip 21 "PUT /providers/:id"; fi

# ── 22-27: Tickets ────────────────────────────────────────
echo -e "\n${BOLD}── Tickets (ticket-service :4002) ───────────────────${NC}"

TICKET_ID=""

# 22
req POST "$TICKET_URL/tickets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT" \
    -d "{\"title\":\"Vazamento na cozinha\",\"description\":\"Torneira com vazamento constante.\",\"location\":\"Cozinha\",\"apartmentId\":\"$APARTMENT_SNAPSHOT_ID\"}"
check 22 "POST /tickets (criar → 201)" 201 "$STATUS" "$BODY"
TICKET_ID=$(jf "$BODY" "id")

# 23
req GET "$TICKET_URL/tickets" -H "Authorization: Bearer $JWT"
check 23 "GET /tickets (listar)" 200 "$STATUS" "$BODY"

# 24
if [ -n "$TICKET_ID" ]; then
    req GET "$TICKET_URL/tickets/$TICKET_ID" -H "Authorization: Bearer $JWT"
    check 24 "GET /tickets/:id" 200 "$STATUS" "$BODY"
else skip 24 "GET /tickets/:id"; fi

# 25
if [ -n "$TICKET_ID" ]; then
    req PUT "$TICKET_URL/tickets/$TICKET_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT" \
        -d '{"status":"IN_PROGRESS"}'
    check 25 "PUT /tickets/:id (status → IN_PROGRESS)" 200 "$STATUS" "$BODY"
else skip 25 "PUT /tickets/:id"; fi

# 26
req GET "$TICKET_URL/tickets/apartment/$APARTMENT_SNAPSHOT_ID" -H "Authorization: Bearer $JWT"
check 26 "GET /tickets/apartment/:apartmentId" 200 "$STATUS" "$BODY"

# 27
if [ -n "$TICKET_ID" ]; then
    req DELETE "$TICKET_URL/tickets/$TICKET_ID" -H "Authorization: Bearer $JWT"
    check 27 "DELETE /tickets/:id" 204 "$STATUS" ""
else skip 27 "DELETE /tickets/:id"; fi

# ── 28-33: Maintenances ───────────────────────────────────
echo -e "\n${BOLD}── Maintenances (ticket-service :4002) ──────────────${NC}"

MAINT_ID=""

# 28
req POST "$TICKET_URL/maintenances" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT" \
    -d "{\"type\":\"Hidráulica\",\"local\":\"Banheiro\",\"priority\":\"Alta\",\"value\":350.00,\"executionDate\":\"2026-07-01T10:00:00.000Z\",\"providerName\":\"Encanador Teste\",\"providerContact\":\"(11) 99999-1111\",\"observation\":\"Troca do registro\",\"apartmentId\":\"$APARTMENT_SNAPSHOT_ID\"}"
check 28 "POST /maintenances (criar → 201)" 201 "$STATUS" "$BODY"
MAINT_ID=$(jf "$BODY" "id")

# 29
req GET "$TICKET_URL/maintenances" -H "Authorization: Bearer $JWT"
check 29 "GET /maintenances (listar)" 200 "$STATUS" "$BODY"

# 30
if [ -n "$MAINT_ID" ]; then
    req GET "$TICKET_URL/maintenances/$MAINT_ID" -H "Authorization: Bearer $JWT"
    check 30 "GET /maintenances/:id" 200 "$STATUS" "$BODY"
else skip 30 "GET /maintenances/:id"; fi

# 31
if [ -n "$MAINT_ID" ]; then
    req PUT "$TICKET_URL/maintenances/$MAINT_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT" \
        -d '{"status":"IN_PROGRESS","observation":"Trabalho iniciado"}'
    check 31 "PUT /maintenances/:id (status → IN_PROGRESS)" 200 "$STATUS" "$BODY"
else skip 31 "PUT /maintenances/:id"; fi

# 32
req GET "$TICKET_URL/maintenances/apartment/$APARTMENT_SNAPSHOT_ID" -H "Authorization: Bearer $JWT"
check 32 "GET /maintenances/apartment/:apartmentId" 200 "$STATUS" "$BODY"

# 33
if [ -n "$MAINT_ID" ]; then
    req DELETE "$TICKET_URL/maintenances/$MAINT_ID" -H "Authorization: Bearer $JWT"
    check 33 "DELETE /maintenances/:id" 204 "$STATUS" ""
else skip 33 "DELETE /maintenances/:id"; fi

# 34 provider cleanup
if [ -n "$PROVIDER_ID" ]; then
    req DELETE "$TICKET_URL/providers/$PROVIDER_ID" -H "Authorization: Bearer $JWT"
    check 34 "DELETE /providers/:id (cleanup)" 204 "$STATUS" ""
else skip 34 "DELETE /providers/:id"; fi

# ── Resultado final ───────────────────────────────────────
TOTAL=$((PASS + FAIL + SKIP))
echo -e "\n${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║                 RESULTADO FINAL                  ║${NC}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
printf "  Total : %s testes\n" "$TOTAL"
printf "  ${GREEN}PASS  :${NC} ${BOLD}%s${NC}\n" "$PASS"
printf "  ${RED}FAIL  :${NC} ${BOLD}%s${NC}\n" "$FAIL"
[ "$SKIP" -gt 0 ] && printf "  ${YELLOW}SKIP  :${NC} ${BOLD}%s${NC}\n" "$SKIP"
echo ""
if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ Todos os testes passaram!${NC}\n"; exit 0
else
    echo -e "${RED}${BOLD}✗ $FAIL teste(s) falharam.${NC}\n"; exit 1
fi
