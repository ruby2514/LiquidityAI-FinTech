#!/usr/bin/env bash
# ============================================================
#  Liquidity.ai — Automated Setup Script (Linux / macOS)
# ============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
BOLD='\033[1m'

banner() {
  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}  ${BOLD}Liquidity.ai${NC} — Financial Intelligence Graph   ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}       Automated Setup for Linux / macOS        ${CYAN}║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════════╝${NC}"
  echo ""
}

step() { echo -e "\n${GREEN}▸ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }
fail() { echo -e "${RED}  ✕ $1${NC}"; exit 1; }
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }

# ── Check prerequisites ──
check_prereqs() {
  step "Checking prerequisites..."

  # Node.js
  if command -v node &>/dev/null; then
    NODE_VER=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
      ok "Node.js $NODE_VER"
    else
      fail "Node.js 18+ required (found $NODE_VER). Install from https://nodejs.org"
    fi
  else
    fail "Node.js not found. Install from https://nodejs.org (v18 or later)"
  fi

  # npm
  if command -v npm &>/dev/null; then
    ok "npm $(npm -v)"
  else
    fail "npm not found. It should come with Node.js."
  fi

  # Git (optional but recommended)
  if command -v git &>/dev/null; then
    ok "Git $(git --version | awk '{print $3}')"
  else
    warn "Git not found — not required but recommended."
  fi

  # Docker (optional)
  if command -v docker &>/dev/null; then
    ok "Docker $(docker --version | awk '{print $3}' | tr -d ',')"
    DOCKER_AVAILABLE=true
  else
    warn "Docker not found — Docker deployment will be unavailable."
    DOCKER_AVAILABLE=false
  fi
}

# ── Install dependencies ──
install_deps() {
  step "Installing Node.js dependencies..."
  npm install --no-audit --no-fund 2>&1 | tail -1
  ok "Dependencies installed"
}

# ── Setup environment ──
setup_env() {
  step "Setting up environment..."
  if [ ! -f .env ]; then
    cp .env.example .env
    # Generate a random JWT secret
    JWT=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/CHANGE_ME_TO_A_RANDOM_64_CHAR_HEX_STRING/$JWT/" .env
    else
      sed -i "s/CHANGE_ME_TO_A_RANDOM_64_CHAR_HEX_STRING/$JWT/" .env
    fi
    ok "Created .env with generated JWT secret"
  else
    ok ".env already exists — skipping"
  fi
}

# ── Create data directory ──
setup_data() {
  step "Creating data directory..."
  mkdir -p data
  ok "data/ directory ready"
}

# ── Build frontend ──
build_frontend() {
  step "Building frontend for production..."
  npm run build 2>&1 | tail -3
  ok "Frontend built to dist/"
}

# ── Summary ──
print_summary() {
  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}             ${BOLD}Setup Complete! 🎉${NC}                ${CYAN}║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${BOLD}Start development server:${NC}"
  echo -e "    ${CYAN}npm run dev${NC}"
  echo -e "    → Frontend: ${GREEN}http://localhost:5173${NC}"
  echo -e "    → API:      ${GREEN}http://localhost:3001${NC}"
  echo ""
  echo -e "  ${BOLD}Start production server:${NC}"
  echo -e "    ${CYAN}npm start${NC}"
  echo -e "    → App: ${GREEN}http://localhost:3001${NC}"
  echo ""

  if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "  ${BOLD}Docker deployment (for sharing on LAN):${NC}"
    echo -e "    ${CYAN}docker compose up --build -d${NC}"
    echo -e "    → App: ${GREEN}http://<YOUR_IP>:4001${NC}"
    echo ""
  fi

  echo -e "  ${BOLD}Default admin account:${NC}"
  echo -e "    ${YELLOW}Liquidity.ai${NC} (Super Admin)"
  echo -e "    Email:    admin@liquidity.ai"
  echo -e "    Password: Liquidity2026!"
  echo ""
  echo -e "  ${RED}⚠ Change this password after first login!${NC}"
  echo ""
}

# ── Main ──
banner
check_prereqs
install_deps
setup_env
setup_data
build_frontend
print_summary
