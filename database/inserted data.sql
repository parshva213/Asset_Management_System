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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4901d208-f29b-11f0-993e-2c58b9de6848:1-969';

--
-- Dumping data for table `asset_assignments`
--

LOCK TABLES `asset_assignments` WRITE;
/*!40000 ALTER TABLE `asset_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `asset_requests`
--

LOCK TABLES `asset_requests` WRITE;
/*!40000 ALTER TABLE `asset_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,2,'Desktop Computers','Office desktop PCs and workstations','2026-02-05 06:44:16'),(2,2,'Laptops','Employee and executive laptops','2026-02-05 06:44:16'),(3,2,'Servers','Physical and rack-mounted servers','2026-02-05 06:44:16'),(4,2,'Monitors & Displays','LED, LCD, and curved monitors','2026-02-05 06:44:16'),(5,2,'Printers & Scanners','Printing and scanning devices','2026-02-05 06:44:16'),(6,2,'Networking Equipment','Routers, switches, and firewalls','2026-02-05 06:44:16'),(7,2,'Storage Devices','NAS, SAN, and external storage','2026-02-05 06:44:16'),(8,2,'Mobile Devices','Smartphones and tablets','2026-02-05 06:44:16'),(9,2,'Office Furniture','Desks, chairs, and workstations','2026-02-05 06:44:16'),(10,2,'Power Equipment','UPS, inverters, and power units','2026-02-05 06:44:16'),(11,2,'Cabling & Accessories','LAN cables, adapters, docks','2026-02-05 06:44:16'),(12,2,'Projectors & AV Equipment','Projectors, speakers, microphones','2026-02-05 06:44:16'),(13,2,'Security Equipment','CCTV, biometric, and access systems','2026-02-05 06:44:16'),(14,2,'Machinery & Tools','Industrial tools and machinery','2026-02-05 06:44:16'),(15,2,'HVAC Systems','Air conditioning and ventilation systems','2026-02-05 06:44:16'),(16,2,'Electrical Equipment','Generators and electrical panels','2026-02-05 06:44:16'),(17,2,'Software Licenses','Operating systems and licensed software','2026-02-05 06:44:16'),(18,2,'Cloud Services','SaaS and cloud infrastructure services','2026-02-05 06:44:16'),(19,2,'Company Vehicles','Cars, bikes, and delivery vehicles','2026-02-05 06:44:16'),(20,2,'Miscellaneous Assets','Assets not covered in other categories','2026-02-05 06:44:16');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,2,'LJ Polytechnic','LJ Campus','','2026-02-05 06:19:06'),(2,2,'LJ IEM','LJ Campus',NULL,'2026-02-05 06:27:13'),(3,2,'LJ Architecture','LJ Campus',NULL,'2026-02-05 06:27:13'),(4,2,'LJ Commerce','LJ Campus','','2026-02-05 06:37:53');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `maintenance_records`
--

LOCK TABLES `maintenance_records` WRITE;
/*!40000 ALTER TABLE `maintenance_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Dev Team',NULL,'DEVOP',1,'VENER','Active','2026-02-04 12:58:16','2026-02-04 12:58:16'),(2,'LJ University',NULL,'ME7YN',1,'H4V90','Active','2026-02-04 17:04:41','2026-02-04 17:29:20');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'301','3rd',100,'',1,'2026-02-05 06:21:34'),(2,'302','3rd',50,'',1,'2026-02-05 06:22:08'),(3,'303','3rd',70,'',1,'2026-02-05 06:22:51'),(4,'304','3rd',80,'',1,'2026-02-05 06:23:19'),(5,'305','3rd',60,'',1,'2026-02-05 06:23:48'),(6,'201','2nd',50,NULL,2,'2026-02-05 06:30:58'),(7,'202','2nd',50,NULL,2,'2026-02-05 06:31:27'),(8,'203','2nd',50,NULL,2,'2026-02-05 06:31:35'),(9,'204','2nd',50,NULL,2,'2026-02-05 06:31:47'),(10,'205','2nd',50,NULL,2,'2026-02-05 06:31:52'),(11,'401','4th',50,NULL,3,'2026-02-05 06:33:42'),(12,'402','4th',50,NULL,3,'2026-02-05 06:33:42'),(13,'403','4th',50,NULL,3,'2026-02-05 06:33:42'),(14,'404','4th',50,NULL,3,'2026-02-05 06:33:42'),(15,'405','4th',50,NULL,3,'2026-02-05 06:33:42');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Dev Rana','dr@gmail.com','$2a$10$rjrDMFcOjIke.foGPEMmMeIdtGtoNWWtCcYv9dwuKMm10.JB0IJgW','Vendor','Active','Silicon System','9054466886','UPA3D',NULL,NULL,NULL,NULL,'2026-02-04 13:18:34','2026-02-04 13:18:34'),(2,'Parshva Shah','ps@gmail.com','$2a$10$WnTyyjFufqXcEzlwG.finulp5ErK278rcyEwwRZp3BRY3gantJ9He','Software Developer','Active',NULL,'9904788108','CTOHV','DEVOP',1,NULL,NULL,'2026-02-04 13:24:13','2026-02-04 13:24:13'),(3,'LJ Admin','lja@gmial.com','$2a$10$1bMPGkCOeUNkusKgSYg1GOv0IFeoSJeZHMRrn5S1XA/jWNM4WarlO','Super Admin','Active',NULL,'7896541230','AHZMA','ME7YN',2,NULL,NULL,'2026-02-04 17:08:22','2026-02-05 06:17:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `vendor_org`
--

LOCK TABLES `vendor_org` WRITE;
/*!40000 ALTER TABLE `vendor_org` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_org` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-05 12:21:10
