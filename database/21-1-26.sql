CREATE DATABASE  IF NOT EXISTS `asset_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `asset_management`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: asset_management
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4901d208-f29b-11f0-993e-2c58b9de6848:1-224';

--
-- Table structure for table `asset_assignments`
--

DROP TABLE IF EXISTS `asset_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `user_id` int NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `assigned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unassigned_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `asset_id` (`asset_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_asset_assignments_asset` (`asset_id`),
  KEY `idx_asset_assignments_user` (`user_id`),
  CONSTRAINT `asset_assignments_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_assignments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_assignments`
--

LOCK TABLES `asset_assignments` WRITE;
/*!40000 ALTER TABLE `asset_assignments` DISABLE KEYS */;
INSERT INTO `asset_assignments` VALUES (1,1,4,'','2026-01-21 15:15:14','2026-01-21 15:15:14','2026-01-21 15:15:14',NULL);
/*!40000 ALTER TABLE `asset_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_requests`
--

DROP TABLE IF EXISTS `asset_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int DEFAULT NULL,
  `request_type` enum('Repair','Replacement','New Asset') NOT NULL,
  `reason` varchar(100) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `status` enum('Pending','In Progress','Approved','Rejected','Completed') DEFAULT 'Pending',
  `requested_by` int NOT NULL,
  `assigned_to` int DEFAULT NULL,
  `response` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `asset_id` (`asset_id`),
  KEY `requested_by` (`requested_by`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `asset_requests_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_requests_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_requests`
--

LOCK TABLES `asset_requests` WRITE;
/*!40000 ALTER TABLE `asset_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `status` enum('Available','Assigned','Under Maintenance','Exit Pending','Retired') DEFAULT 'Available',
  `asset_type` enum('Hardware','Software') NOT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `purchase_cost` decimal(10,2) DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `category_id` (`category_id`),
  KEY `location_id` (`location_id`),
  KEY `room_id` (`room_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `assigned_by` (`assigned_by`),
  KEY `created_by` (`created_by`),
  KEY `idx_assets_location_status` (`location_id`,`status`),
  KEY `idx_assets_assigned_to` (`assigned_to`),
  KEY `idx_assets_category_location` (`category_id`,`location_id`),
  KEY `fk_assets_org` (`org_id`),
  CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_4` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_5` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assets_org` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,2,'PC','Screen','LJP-001',1,1,1,'Assigned','Hardware','2026-01-19','2026-01-19',100.00,4,2,6,'2026-01-19 17:02:09','2026-01-21 15:15:14');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,0,'Electronics','Electronic hardware assets','2026-01-19 06:18:18');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_locations_org` (`org_id`),
  CONSTRAINT `fk_locations_org` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,2,'LJ Polytechnic','','','2026-01-19 06:19:01'),(2,2,'LJ IEM','','','2026-01-19 10:35:59'),(3,2,'LJ Commerce','','','2026-01-19 10:41:52');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_records`
--

DROP TABLE IF EXISTS `maintenance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `maintenance_by` int NOT NULL,
  `maintenance_type` enum('Repair','Configuration','Upgrade') NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `asset_id` (`asset_id`),
  KEY `maintenance_by` (`maintenance_by`),
  CONSTRAINT `maintenance_records_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_records_ibfk_2` FOREIGN KEY (`maintenance_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_records`
--

LOCK TABLES `maintenance_records` WRITE;
/*!40000 ALTER TABLE `maintenance_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `orgpk` varchar(255) DEFAULT NULL,
  `member` varchar(255) DEFAULT NULL,
  `v_opk` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('Active','Suspended','Closed','Deleted') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_v_opk` (`v_opk`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Team',NULL,'DEVOP','0',NULL,'2026-01-16 12:07:36','2026-01-19 17:47:47','Active'),(2,'LJ University',NULL,'18K2U','1','IPOZZ','2026-01-12 07:31:23','2026-01-16 12:12:40','Active');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supervisor_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `asset_name` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  `quote` decimal(10,2) DEFAULT NULL,
  `status` enum('Requested','Quoted','Approved','Rejected','Delivered') DEFAULT 'Requested',
  `admin_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `purchase_orders_ibfk_3` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `floor` varchar(25) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'lab 301','3',100,'',1,'2026-01-21 12:23:05');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` enum('Employee','Maintenance','software developer','Super Admin','Supervisor','Vendor') NOT NULL,
  `status` enum('Active','On Leave','Resigned','Retired','Terminated') NOT NULL DEFAULT 'Active',
  `department` varchar(50) DEFAULT NULL,
  `phone` varchar(25) NOT NULL,
  `ownpk` varchar(255) NOT NULL,
  `unpk` varchar(5) DEFAULT NULL,
  `org_id` int DEFAULT NULL,
  `loc_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `ownpk` (`ownpk`),
  KEY `role` (`role`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_org_status` (`org_id`,`status`),
  CONSTRAINT `fk_users_organization_id` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `chk_unpk_required` CHECK (((`role` = _utf8mb4'vendor') or (`unpk` is not null)))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'log user','log@gmail.com','$2a$10$H0/u.tkiMPnTFzwvnfpwD.xYzvRaXYhhFECxGnQ/p7xjX3w6tNszO','software developer','Active',NULL,'9904788108','AATLP','DEVOP',1,NULL,NULL,'2026-01-18 12:20:54','2026-01-21 09:38:52'),(2,'Admin User','admin@gmail.com','$2a$10$ZKhYoRI2QoIjm4VM5n59aeahw01.CSuRAERZjsL94mhXLig79mgqy','Super Admin','Active',NULL,'1234567890','ZQ689','18K2U',2,NULL,NULL,'2026-01-19 06:05:01','2026-01-19 17:19:38'),(3,'supervisor','sup@gmail.com','$2a$10$qJShzocPNsFZSsd7MY4lyeaovrz1OosjRBixqA9BQGhgwoMxewuvm','Supervisor','Active',NULL,'1231234568','KM477','ZQ689',2,NULL,NULL,'2026-01-19 17:02:09','2026-01-19 17:02:09'),(4,'main','main@gmial.com','$2a$10$Wh1bf8LGeo9PUa8LDB0d8.FtWI4qRKnuJdidE5yoWqAEqRZ364NZ2','Maintenance','Active',NULL,'7418529630','XM2MH','ZQ689',2,1,NULL,'2026-01-19 17:03:16','2026-01-21 16:11:00'),(5,'emp','emp01@gmail.com','$2a$10$EhPmPIJdgtCmdy6HBPU2TeBjtU09wOWEBIg3gHMarY0w3ewILNkEG','Employee','Active',NULL,'9638520741','HGLLZ','KM477',2,NULL,NULL,'2026-01-19 17:04:26','2026-01-19 17:04:56'),(6,'vendor','ven@gmail.com','$2a$10$O9dWiShyLXE3mVovEb0H8u5y0ah4VM7TydgK0uJiZwbC29CE5J7SS','Vendor','Active','ams','1237894560','E3C25',NULL,NULL,NULL,NULL,'2026-01-19 18:17:41','2026-01-19 18:17:41'),(7,'Parshva Shah','mail.dummy10356@gmail.com','$2a$10$u8VInCDKSQlxhG.zaFQd6OfoNLR805mJ3k7l9qNN8vHMs9CZ0f5Dm','software developer','Active',NULL,'9904788108','6OV0J','DEVOP',1,NULL,NULL,'2026-01-21 09:36:29','2026-01-21 09:36:29');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_user_insert_set_room_location` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
    -- Check if the role of the user being inserted is 'Employee'
    IF NEW.role = 'Employee' THEN
        -- Call function to determine the room ID
        SET NEW.room_id = GetRoomIdFromKeyChain(NEW.unpk); 

        -- Check if a room_id was successfully found (assuming room_id is INT/numeric)
        IF NEW.room_id IS NOT NULL AND NEW.room_id <> 0 THEN
			-- Fetch the associated location_id using a subquery and assign it
			SET NEW.loc_id = (SELECT location_id FROM rooms WHERE id = NEW.room_id);
        END IF;
    END IF;
    
    -- If the role is not 'Employee', NEW.room_id and NEW.loc_id remain NULL
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_unassign_assets_on_user_exit` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
    -- Run only when user is changing from Active to non-active
    IF OLD.status = 'Active'
       AND NEW.status IN ('Resigned', 'Retired', 'Terminated') THEN

        -- Mark assigned assets as Exit Pending
        UPDATE assets
        SET status = 'Exit Pending',
            assigned_to = NULL
        WHERE assigned_to = OLD.id;

        -- Close assignment history
        UPDATE asset_assignments
        SET unassigned_at = CURRENT_TIMESTAMP
        WHERE user_id = OLD.id
          AND unassigned_at IS NULL;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `vendor_org`
--

DROP TABLE IF EXISTS `vendor_org`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_org` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `org_key` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_vendor_org_user` (`vendor_id`),
  KEY `fk_vendor_org_org_key` (`org_key`),
  CONSTRAINT `fk_vendor_org_org_key` FOREIGN KEY (`org_key`) REFERENCES `organizations` (`v_opk`),
  CONSTRAINT `fk_vendor_org_user` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_org`
--

LOCK TABLES `vendor_org` WRITE;
/*!40000 ALTER TABLE `vendor_org` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_org` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'asset_management'
--

--
-- Dumping routines for database 'asset_management'
--
/*!50003 DROP FUNCTION IF EXISTS `GetOrganizationIdByUnpkChain` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `GetOrganizationIdByUnpkChain`(input_unpk VARCHAR(5)) RETURNS int
    DETERMINISTIC
BEGIN
    DECLARE result_org_id INT DEFAULT NULL;
    DECLARE current_key VARCHAR(255);
    DECLARE counter INT DEFAULT 0;

    SET current_key = input_unpk;

    WHILE counter < 4 AND result_org_id IS NULL AND current_key IS NOT NULL DO
        
        -- Check if the current_key matches an orgpk in the organizations table
        SELECT id INTO result_org_id 
        FROM organizations 
        WHERE orgpk = current_key LIMIT 1;

        -- If found in organizations, the loop ends as result_org_id is set.
        
        -- If not found yet, try to find a parent user's ownpk that matches the current key 
        -- to get their unpk for the next iteration
        IF result_org_id IS NULL THEN
            SELECT unpk INTO current_key 
            FROM users 
            WHERE ownpk = current_key LIMIT 1;
        END IF;

        SET counter = counter + 1;
    END WHILE;

    RETURN result_org_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetRoomIdFromKeyChain` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `GetRoomIdFromKeyChain`(start_unpk VARCHAR(5)) RETURNS int
    DETERMINISTIC
BEGIN
    DECLARE current_key VARCHAR(255);
    DECLARE current_role_check VARCHAR(50);
    DECLARE result_room_id INT DEFAULT NULL;
    DECLARE counter INT DEFAULT 0;

    SET current_key = start_unpk;

    WHILE counter < 4 AND result_room_id IS NULL AND current_key IS NOT NULL DO
        
        -- First, find the user associated with the key and check their role
        SELECT role, room_id INTO current_role_check, result_room_id
        FROM users 
        WHERE ownpk = current_key LIMIT 1;

        -- If the role found is 'Supervisor', we stop the search chain here
        IF current_role_check = 'Supervisor' THEN
            -- We keep the result_room_id found in the supervisor's row (which might be NULL if not set)
            SET current_key = NULL; -- This terminates the WHILE loop
        ELSE 
            -- If not a Supervisor, try to find the next UNPK in the chain
            SELECT unpk INTO current_key 
            FROM users 
            WHERE ownpk = current_key LIMIT 1;
        END IF;

        SET counter = counter + 1;
        
    END WHILE;

    -- Return whatever room_id was found during the process (might be NULL)
    RETURN result_room_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-21 22:24:28
