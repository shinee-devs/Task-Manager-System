<?php
declare(strict_types=1);

final class DatabaseSessionHandler implements SessionHandlerInterface
{
    private ?PDO $connection = null;

    public function open(string $path, string $name): bool
    {
        return true;
    }

    public function close(): bool
    {
        return true;
    }

    public function read(string $sessionId): string|false
    {
        $statement = $this->connection()->prepare(
            'SELECT payload, expires_at FROM php_sessions WHERE session_id = :session_id LIMIT 1'
        );
        $statement->execute(['session_id' => $sessionId]);
        $session = $statement->fetch();

        if ($session === false) {
            return '';
        }

        if ((int) $session['expires_at'] <= time()) {
            $this->destroy($sessionId);
            return '';
        }

        return (string) $session['payload'];
    }

    public function write(string $sessionId, string $data): bool
    {
        $statement = $this->connection()->prepare(
            'INSERT INTO php_sessions (session_id, payload, expires_at)
             VALUES (:session_id, :payload, :expires_at)
             ON DUPLICATE KEY UPDATE payload = VALUES(payload), expires_at = VALUES(expires_at)'
        );

        return $statement->execute([
            'session_id' => $sessionId,
            'payload' => $data,
            'expires_at' => time() + (int) ini_get('session.gc_maxlifetime'),
        ]);
    }

    public function destroy(string $sessionId): bool
    {
        $statement = $this->connection()->prepare('DELETE FROM php_sessions WHERE session_id = :session_id');
        return $statement->execute(['session_id' => $sessionId]);
    }

    public function gc(int $maxLifetime): int|false
    {
        $statement = $this->connection()->prepare('DELETE FROM php_sessions WHERE expires_at <= :now');
        if (!$statement->execute(['now' => time()])) {
            return false;
        }

        return $statement->rowCount();
    }

    private function connection(): PDO
    {
        if (!$this->connection instanceof PDO) {
            require_once __DIR__ . '/database.php';
            $this->connection = get_database_connection();
        }

        return $this->connection;
    }
}