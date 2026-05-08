INSERT IGNORE INTO `user` (`id_user`, `first_name`, `last_name`, `email`, `password_hash`, `role`, `created_at`)
VALUES
(1, 'Адмін', 'Діана', 'diana.iuzyfovych@nure.ua', '$2a$12$NnZp4UuV6o5NKUB4nIbrM.SEXqq1G30ZMOtJVaJM7mevhdEMQ92zq', 'ADMIN', CURRENT_TIMESTAMP);