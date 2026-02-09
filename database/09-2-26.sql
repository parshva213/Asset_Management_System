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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4901d208-f29b-11f0-993e-2c58b9de6848:1-1114';

--
-- Table structure for table `asset_assignments`
--

DROP TABLE IF EXISTS `asset_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `assigned_to` int NOT NULL,
  `assigned_by` int DEFAULT NULL,
  `unassigned_by` int DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `assigned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unassigned_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_asset_active_assignment` (`asset_id`,`assigned_at`),
  KEY `fk_asset_assignments_assigned_to` (`assigned_to`),
  KEY `fk_asset_assignments_assigned_by` (`assigned_by`),
  KEY `fk_asset_assignments_unassigned_by` (`unassigned_by`),
  CONSTRAINT `fk_asset_assignments_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asset_assignments_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_asset_assignments_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asset_assignments_unassigned_by` FOREIGN KEY (`unassigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_assignments`
--

LOCK TABLES `asset_assignments` WRITE;
/*!40000 ALTER TABLE `asset_assignments` DISABLE KEYS */;
INSERT INTO `asset_assignments` VALUES (1,1,10,2,NULL,'','2026-02-09 11:12:02','2026-02-09 11:12:02','2026-02-09 11:12:02',NULL);
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
  UNIQUE KEY `uq_asset_request` (`asset_id`,`requested_by`,`created_at`),
  KEY `fk_asset_requests_requested_by` (`requested_by`),
  KEY `fk_asset_requests_assigned_to` (`assigned_to`),
  CONSTRAINT `fk_asset_requests_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asset_requests_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_asset_requests_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
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
  `name` varchar(100) NOT NULL,
  `org_id` int NOT NULL,
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
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_asset_category_id_idx` (`category_id`),
  KEY `fk_asset_loc_id_idx` (`location_id`),
  KEY `fk_asset_room_id_idx` (`room_id`),
  KEY `fk_asset_created_by_idx` (`created_by`),
  KEY `fk_asset_org_id_idx` (`org_id`),
  CONSTRAINT `fk_asset_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_asset_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_asset_loc_id` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  CONSTRAINT `fk_asset_org_id` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `fk_asset_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0001',2,1,2,'Assigned','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 11:12:02'),(2,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0002',2,1,2,'Available','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 05:52:56'),(3,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0003',2,1,2,'Available','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 05:52:56'),(4,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0004',2,1,2,'Available','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 05:52:56'),(5,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0005',2,1,2,'Available','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 05:52:56'),(6,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0006',2,1,2,'Available','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 05:52:56'),(7,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0007',2,1,2,'Available','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 05:52:56'),(8,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0008',2,1,2,'Available','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 05:52:56'),(9,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0009',2,1,2,'Available','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 05:52:56'),(10,'Apple MacBook Air',2,NULL,'APPLE-MA-HW-2-1/0010',2,1,2,'Available','Hardware','2026-02-09',NULL,100000.00,2,'2026-02-09 05:52:56','2026-02-09 05:52:56');
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
  `type` enum('Hardware','Software') NOT NULL DEFAULT 'Hardware',
  `description` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_category_org_name` (`org_id`,`name`),
  KEY `fk_category_org_id_idx` (`org_id`),
  CONSTRAINT `fk_category_org_id` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (2,2,'Laptops','Hardware','Employee and executive laptops','2026-02-08 03:45:40'),(3,2,'Servers','Hardware','Physical and rack-mounted servers','2026-02-08 03:45:40'),(4,2,'Monitors & Displays','Hardware','LED, LCD, and curved monitors','2026-02-08 03:45:40'),(5,2,'Printers & Scanners','Hardware','Printing and scanning devices','2026-02-08 03:45:40'),(6,2,'Networking Equipment','Hardware','Routers, switches, and firewalls','2026-02-08 03:45:40'),(7,2,'Storage Devices','Hardware','NAS, SAN, and external storage','2026-02-08 03:45:40'),(8,2,'Mobile Devices','Hardware','Smartphones and tablets','2026-02-08 03:45:40'),(9,2,'Power Equipment','Hardware','UPS, inverters, and power units','2026-02-08 03:45:40'),(10,2,'Cabling & Accessories','Hardware','LAN cables, adapters, docks','2026-02-08 03:45:40'),(11,2,'Projectors & AV Equipment','Hardware','Projectors, speakers, microphones','2026-02-08 03:45:40'),(12,2,'Security Equipment','Hardware','CCTV, biometric, access systems','2026-02-08 03:45:40'),(13,2,'Software Licenses','Software','Operating systems and licensed software','2026-02-08 03:45:40'),(14,2,'Cloud Services','Software','SaaS and cloud infrastructure services','2026-02-08 03:45:40'),(15,2,'Development Tools','Software','IDEs, code editors, dev utilities','2026-02-08 03:45:40'),(16,2,'Database Systems','Software','SQL and NoSQL database platforms','2026-02-08 03:45:40'),(17,2,'Operating Systems','Software','Windows, Linux, macOS distributions','2026-02-08 03:45:40'),(18,2,'Security Software','Software','Antivirus, endpoint, firewall software','2026-02-08 03:45:40'),(19,2,'Backup & Recovery Software','Software','Data backup and disaster recovery tools','2026-02-08 03:45:40'),(20,2,'IT Management Tools','Software','Monitoring, asset, and ITSM tools','2026-02-08 03:45:40');
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
  `address` varchar(255) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_org_name` (`org_id`,`name`),
  KEY `fk_location_org_id_idx` (`org_id`),
  CONSTRAINT `fk_location_org_id` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,2,'LJ Polytechnic','LJ Campus','','2026-02-07 12:33:47'),(2,2,'LJ Commerce','LJ Campus','Commerce department building','2026-02-08 03:33:08');
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
  `maintenance_by` int DEFAULT NULL,
  `maintenance_type` enum('Repair','Configuration','Upgrade') NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_maintenance_asset_time` (`asset_id`,`created_at`),
  KEY `fk_maintenance_by` (`maintenance_by`),
  CONSTRAINT `fk_maintenance_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_maintenance_by` FOREIGN KEY (`maintenance_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
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
  `orgpk` varchar(10) NOT NULL,
  `member` tinyint NOT NULL DEFAULT '1',
  `v_opk` varchar(10) NOT NULL,
  `status` enum('Active','Suspended','Closed','Deleted') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_v_opk` (`v_opk`),
  UNIQUE KEY `orgpk_UNIQUE` (`orgpk`),
  UNIQUE KEY `uq_org_orgpk` (`orgpk`),
  UNIQUE KEY `uq_org_vopk` (`v_opk`),
  UNIQUE KEY `uq_org_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Dev Team',NULL,'DEVOP',1,'VENER','Active','2026-02-04 12:58:16','2026-02-04 12:58:16'),(2,'LJ University',NULL,'ME7YN',1,'H4V90','Active','2026-02-04 17:04:41','2026-02-04 17:29:20');
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
  UNIQUE KEY `uq_purchase_vendor_asset` (`vendor_id`,`asset_name`,`created_at`),
  KEY `fk_purchase_supervisor` (`supervisor_id`),
  KEY `fk_purchase_admin` (`admin_id`),
  CONSTRAINT `fk_purchase_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_purchase_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_purchase_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
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
  `floor` varchar(25) NOT NULL,
  `capacity` int DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `location_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_location_name` (`location_id`,`name`),
  KEY `fk_room_loc_id_idx` (`location_id`),
  CONSTRAINT `fk_room_loc_id` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'Lab 301','3',60,'',1,'2026-02-07 12:34:10'),(2,'Lab 302','3',60,'',1,'2026-02-08 03:15:20'),(3,'Lab 303','3',60,NULL,1,'2026-02-08 03:17:23'),(4,'Lab 304','3',60,NULL,1,'2026-02-08 03:17:23'),(5,'Lab 305','3',60,NULL,1,'2026-02-08 03:17:23'),(6,'Lab 306','3',60,NULL,1,'2026-02-08 03:17:23'),(7,'Lab 307','3',40,NULL,1,'2026-02-08 03:17:23'),(8,'Lab 308','3',60,NULL,1,'2026-02-08 03:17:23'),(9,'Lab 309','3',60,NULL,1,'2026-02-08 03:17:23'),(10,'101','1st',60,'Commerce classroom',2,'2026-02-08 03:33:08'),(11,'102','1st',60,'Commerce classroom',2,'2026-02-08 03:33:08'),(12,'103','1st',55,'Commerce classroom',2,'2026-02-08 03:33:08'),(13,'104','1st',70,'Commerce classroom',2,'2026-02-08 03:33:08'),(14,'105','1st',50,'Commerce classroom',2,'2026-02-08 03:33:08');
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
  `role` enum('Employee','Maintenance','Software Developer','Super Admin','Supervisor','Vendor') NOT NULL,
  `status` enum('Active','On Leave','Resigned','Retired','Terminated') DEFAULT 'Active',
  `department` varchar(50) DEFAULT NULL,
  `phone` varchar(25) NOT NULL,
  `ownpk` varchar(10) NOT NULL,
  `unpk` varchar(10) DEFAULT NULL,
  `org_id` int DEFAULT NULL,
  `loc_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE` (`phone`,`email`,`ownpk`),
  UNIQUE KEY `uq_users_ownpk` (`ownpk`),
  KEY `fk_user_org_id_idx` (`org_id`),
  KEY `fk_user_set_loc_and_room_idx` (`loc_id`,`room_id`),
  KEY `fk_user_room_id_idx` (`room_id`),
  KEY `idx_users_email_phone_org_status` (`email`,`phone`,`org_id`,`status`),
  CONSTRAINT `fk_user_loc_id` FOREIGN KEY (`loc_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_user_org_id` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_user_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `chk_unpk_required` CHECK (((`role` = _utf8mb4'vendor') or (`unpk` is not null)))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Parshva Shah','ps@gmail.com','$2a$10$BlJQXitN8mXy5IWFf0pd4eskNU.kmGtqRTxe6EPf.OoKmf1.w44MC','Software Developer','Active',NULL,'9904788108','XWANK','DEVOP',1,NULL,NULL,'2026-02-07 12:32:27','2026-02-07 12:32:27'),(2,'Amit Sir','lja@gmial.com','$2a$10$iWVparbszJvX/vP9yg.rFOZpnhU6tTNWvn15hN86Hdu.4bs79lh7a','Super Admin','Active',NULL,'9632587410','DU5XR','ME7YN',2,NULL,NULL,'2026-02-07 12:33:13','2026-02-08 03:18:19'),(3,'Rakesh Patel','ljm1@gmail.com','$2a$10$Mrn1ZIorZKG9024fkBZ/wOb72Qrxh8B6.bdeMInSdcyAz/1FXwE9a','Maintenance','Active',NULL,'9638520741','YYJOP','DU5XR',2,NULL,NULL,'2026-02-08 04:58:19','2026-02-08 04:58:19'),(4,'Nehal Purabhiya','ljm2@gmail.com','$2a$10$dMyFADa6VsZxLiGP3Rf8sOBLC8zSBU6OHrJU6ikvqRhPwTEMY5AlS','Maintenance','Active',NULL,'7410852963','YHB7K','DU5XR',2,NULL,NULL,'2026-02-08 04:58:58','2026-02-08 04:58:58'),(5,'Divya Shah','ljm3@gmail.com','$2a$10$.HHDRCFDS2Uo6afC3OTHfuwiJoEhtcBLFQRsW7MXDfqwP2TjIch1O','Maintenance','Active',NULL,'7894563201','DF8CC','DU5XR',2,NULL,NULL,'2026-02-08 04:59:43','2026-02-08 04:59:43'),(6,'Vanshil Pathak','ljm4@gmail.com','$2a$10$I7i0aoNruIyofWdREz2BBeCht5OJ03uzcpso1GUv659wNrQS1wMcm','Maintenance','Active',NULL,'7418520963','M4OUJ','DU5XR',2,NULL,NULL,'2026-02-08 05:00:34','2026-02-08 05:00:34'),(7,'Sonam kapoor','ljm5@gmail.com','$2a$10$9jfXmyu/c3C/UNN.wZtAzeF7rWEgRt4ZJF/upyyXQgf5VW1GPimQy','Maintenance','Active',NULL,'7453201458','60BYZ','DU5XR',2,NULL,NULL,'2026-02-08 05:01:54','2026-02-08 05:01:54'),(8,'Amit Sir','ljs1@gmail.com','$2a$10$jf1g2YlSplzVyAXeH/dZT.WhC.qAbiiDzzhEtHSoMTgQ74c0n1tNq','Supervisor','Active','CE','7410852096','9VROY','DU5XR',2,1,5,'2026-02-08 05:03:08','2026-02-08 05:03:08'),(9,'Shurbhi maam','ljs2@gmail.com','$2a$10$ri2IbAQ59px3W3PJFvSCiOr4Eo0t1KjsLrhJdoOTe8IM9xr5n7eD2','Supervisor','Active','CE','7896541230','8WDS1','DU5XR',2,1,1,'2026-02-08 05:04:11','2026-02-09 10:43:16'),(10,'Priyank sir','ljs3@gmail.com','$2a$10$fqQ6Fq2.JksYBllmqYcja.aOl4Szwm71i/kD5jDYWzF0GsP2OBmDW','Supervisor','Active','IT','7418520963','X1BBW','DU5XR',2,1,2,'2026-02-08 05:05:27','2026-02-08 05:05:27'),(11,'Noopor Maam','ljs4@gmail.com','$2a$10$3EbjTRIFLYjCAGojhQwezu8rzcaA07Xx9D4HqZNO0FXXPfsII7cDe','Supervisor','Active','IT','7896541232','KEH4T','DU5XR',2,1,3,'2026-02-08 05:07:53','2026-02-08 05:07:53'),(12,'Hanuman sir','ljs5@gmail.com','$2a$10$Z0ySZIAjXynRmQxvnQk10ejsbYAkL14zwGAdQYtapaBtwJldnUihm','Supervisor','Active','AIML','7563410965','PF2T6','DU5XR',2,1,4,'2026-02-08 05:08:45','2026-02-08 05:08:45'),(13,'Vicky Sir','ljs6@gmail.com','$2a$10$ROvH6E3/1fsOaJ67t68AcOVB.nX3CEvVQNRAgM4VUau5J.gB682Dy','Supervisor','Active','CE','1234567890','9ILH8','DU5XR',2,1,2,'2026-02-08 05:10:03','2026-02-08 05:10:03'),(14,'rtgh','lje1@gmail.com','$2a$10$UyPFmGN3hinXSq4bVF7T4u7zI30H8CUXFOdJuq4ijo51XIrCBNg5C','Employee','Active',NULL,'7410256965','9A4KX','9VROY',2,NULL,5,'2026-02-08 05:20:14','2026-02-09 06:38:07'),(15,'erfgb','ljl5e2@gmail.com','$2a$10$82rGrzzc4ICw/lqvRFSaGOociMnW9opqNTU5rVIyh677uixsaViyq','Employee','Active',NULL,'9527851643','R7PFP','9VROY',2,NULL,NULL,'2026-02-08 05:23:34','2026-02-08 05:23:34');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

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
  UNIQUE KEY `uq_vendor_org` (`vendor_id`,`org_key`),
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
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-09 16:54:00
