CREATE DATABASE IF NOT EXISTS `autoelite`;

USE `autoelite`;

DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `purchase`;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `fullname` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL UNIQUE,
  `phone` VARCHAR(15) DEFAULT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `profilepic` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `cart` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `car_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `purchase` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `cars` JSON NOT NULL,
  `user_id` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `purchase_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('ongoing', 'completed', 'cancelled') DEFAULT 'ongoing',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `users` (`username`, `email`, `password`) VALUES
('user', 'user@gmail.com', '12345678');