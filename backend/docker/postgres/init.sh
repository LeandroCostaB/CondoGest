#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE condogest_core;
  CREATE DATABASE condogest_tickets;
  CREATE DATABASE condogest_notifications;
EOSQL
