SELECT 'CREATE DATABASE condogest_core'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'condogest_core'
)\gexec

SELECT 'CREATE DATABASE condogest_ticket'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'condogest_ticket'
)\gexec
