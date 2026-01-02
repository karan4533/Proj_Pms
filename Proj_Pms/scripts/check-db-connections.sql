-- Check current max_connections
SHOW max_connections;

-- Check current active connections
SELECT count(*) as active_connections FROM pg_stat_activity;

-- View all connections
SELECT pid, usename, application_name, client_addr, state, query_start 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY query_start;

-- Terminate idle connections older than 5 minutes
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '5 minutes'
AND pid != pg_backend_pid();
