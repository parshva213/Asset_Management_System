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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4901d208-f29b-11f0-993e-2c58b9de6848:1-1092';

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
INSERT INTO `categories` VALUES (1,2,'Desktop Computers','Hardware','Office desktop PCs and workstations','2026-02-08 03:45:40'),(2,2,'Laptops','Hardware','Employee and executive laptops','2026-02-08 03:45:40'),(3,2,'Servers','Hardware','Physical and rack-mounted servers','2026-02-08 03:45:40'),(4,2,'Monitors & Displays','Hardware','LED, LCD, and curved monitors','2026-02-08 03:45:40'),(5,2,'Printers & Scanners','Hardware','Printing and scanning devices','2026-02-08 03:45:40'),(6,2,'Networking Equipment','Hardware','Routers, switches, and firewalls','2026-02-08 03:45:40'),(7,2,'Storage Devices','Hardware','NAS, SAN, and external storage','2026-02-08 03:45:40'),(8,2,'Mobile Devices','Hardware','Smartphones and tablets','2026-02-08 03:45:40'),(9,2,'Power Equipment','Hardware','UPS, inverters, and power units','2026-02-08 03:45:40'),(10,2,'Cabling & Accessories','Hardware','LAN cables, adapters, docks','2026-02-08 03:45:40'),(11,2,'Projectors & AV Equipment','Hardware','Projectors, speakers, microphones','2026-02-08 03:45:40'),(12,2,'Security Equipment','Hardware','CCTV, biometric, access systems','2026-02-08 03:45:40'),(13,2,'Software Licenses','Software','Operating systems and licensed software','2026-02-08 03:45:40'),(14,2,'Cloud Services','Software','SaaS and cloud infrastructure services','2026-02-08 03:45:40'),(15,2,'Development Tools','Software','IDEs, code editors, dev utilities','2026-02-08 03:45:40'),(16,2,'Database Systems','Software','SQL and NoSQL database platforms','2026-02-08 03:45:40'),(17,2,'Operating Systems','Software','Windows, Linux, macOS distributions','2026-02-08 03:45:40'),(18,2,'Security Software','Software','Antivirus, endpoint, firewall software','2026-02-08 03:45:40'),(19,2,'Backup & Recovery Software','Software','Data backup and disaster recovery tools','2026-02-08 03:45:40'),(20,2,'IT Management Tools','Software','Monitoring, asset, and ITSM tools','2026-02-08 03:45:40');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,2,'LJ Polytechnic','LJ Campus','','2026-02-07 12:33:47'),(2,2,'LJ Commerce','LJ Campus','Commerce department building','2026-02-08 03:33:08');
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
INSERT INTO `rooms` VALUES (1,'Lab 301','3',60,'',1,'2026-02-07 12:34:10'),(2,'Lab 302','3',60,'',1,'2026-02-08 03:15:20'),(3,'Lab 303','3',60,NULL,1,'2026-02-08 03:17:23'),(4,'Lab 304','3',60,NULL,1,'2026-02-08 03:17:23'),(5,'Lab 305','3',60,NULL,1,'2026-02-08 03:17:23'),(6,'Lab 306','3',60,NULL,1,'2026-02-08 03:17:23'),(7,'Lab 307','3',40,NULL,1,'2026-02-08 03:17:23'),(8,'Lab 308','3',60,NULL,1,'2026-02-08 03:17:23'),(9,'Lab 309','3',60,NULL,1,'2026-02-08 03:17:23'),(10,'101','1st',60,'Commerce classroom',2,'2026-02-08 03:33:08'),(11,'102','1st',60,'Commerce classroom',2,'2026-02-08 03:33:08'),(12,'103','1st',55,'Commerce classroom',2,'2026-02-08 03:33:08'),(13,'104','1st',70,'Commerce classroom',2,'2026-02-08 03:33:08'),(14,'105','1st',50,'Commerce classroom',2,'2026-02-08 03:33:08');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Parshva Shah','ps@gmail.com','$2a$10$BlJQXitN8mXy5IWFf0pd4eskNU.kmGtqRTxe6EPf.OoKmf1.w44MC','Software Developer','Active',NULL,'9904788108','XWANK','DEVOP',1,NULL,NULL,'2026-02-07 12:32:27','2026-02-07 12:32:27'),(2,'Amit Sir','lja@gmial.com','$2a$10$iWVparbszJvX/vP9yg.rFOZpnhU6tTNWvn15hN86Hdu.4bs79lh7a','Super Admin','Active',NULL,'9632587410','DU5XR','ME7YN',2,NULL,NULL,'2026-02-07 12:33:13','2026-02-08 03:18:19');
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

-- Dump completed on 2026-02-08  9:23:39
