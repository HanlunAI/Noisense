-- MySQL dump 10.13  Distrib 8.0.23, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: noisense
-- ------------------------------------------------------
-- Server version	8.0.23

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

--
-- Table structure for table `abnormalities`
--

DROP TABLE IF EXISTS `abnormalities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `abnormalities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device` int NOT NULL,
  `time` datetime DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(45) DEFAULT NULL,
  `videoPath` varchar(45) DEFAULT NULL,
  `streamDuration` time DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `abnormalities`
--

LOCK TABLES `abnormalities` WRITE;
/*!40000 ALTER TABLE `abnormalities` DISABLE KEYS */;
INSERT INTO `abnormalities` VALUES (1,1,'2021-05-31 10:38:17','manual',NULL,NULL),(2,2,'2021-05-31 10:38:17','manual',NULL,NULL),(3,3,'2021-05-31 10:38:17','manual',NULL,NULL),(4,4,'2021-05-31 10:38:17','manual',NULL,NULL),(5,1,'2021-05-31 10:39:21','manual',NULL,NULL),(6,2,'2021-05-31 10:39:21','manual',NULL,NULL),(7,3,'2021-05-31 10:39:21','manual',NULL,NULL),(8,4,'2021-05-31 10:39:21','manual',NULL,NULL),(9,1,'2021-05-31 10:40:51','manual',NULL,NULL),(10,2,'2021-05-31 10:40:51','manual',NULL,NULL),(11,3,'2021-05-31 10:40:51','manual',NULL,NULL),(12,4,'2021-05-31 10:40:51','manual',NULL,NULL),(13,1,'2021-05-31 10:40:54','manual',NULL,NULL),(14,2,'2021-05-31 10:40:54','manual',NULL,NULL),(15,3,'2021-05-31 10:40:54','manual',NULL,NULL),(16,4,'2021-05-31 10:40:54','manual',NULL,NULL),(17,1,'2021-05-31 10:40:56','manual',NULL,NULL),(18,2,'2021-05-31 10:40:56','manual',NULL,NULL),(19,3,'2021-05-31 10:40:56','manual',NULL,NULL),(20,4,'2021-05-31 10:40:56','manual',NULL,NULL),(21,1,'2021-05-31 11:03:12','manual',NULL,NULL),(22,2,'2021-05-31 11:03:12','manual',NULL,NULL),(23,3,'2021-05-31 11:03:12','manual',NULL,NULL),(24,4,'2021-05-31 11:03:12','manual',NULL,NULL),(25,1,'2021-05-31 11:03:36','manual',NULL,NULL),(26,2,'2021-05-31 11:03:36','manual',NULL,NULL),(27,3,'2021-05-31 11:03:36','manual',NULL,NULL),(28,4,'2021-05-31 11:03:36','manual',NULL,NULL),(29,1,'2021-05-31 11:04:15','manual',NULL,NULL),(30,2,'2021-05-31 11:04:15','manual',NULL,NULL),(31,3,'2021-05-31 11:04:15','manual',NULL,NULL),(32,4,'2021-05-31 11:04:15','manual',NULL,NULL),(33,1,'2021-05-31 11:05:26','manual',NULL,'00:00:01'),(34,2,'2021-05-31 11:05:26','manual',NULL,'00:00:01'),(35,3,'2021-05-31 11:05:26','manual',NULL,'00:00:01'),(36,4,'2021-05-31 11:05:26','manual',NULL,'00:00:01'),(37,1,'2021-05-31 11:05:43','manual',NULL,'00:00:05'),(38,2,'2021-05-31 11:05:43','manual',NULL,'00:00:05'),(39,3,'2021-05-31 11:05:43','manual',NULL,'00:00:05'),(40,4,'2021-05-31 11:05:43','manual',NULL,'00:00:05'),(41,1,'2021-05-31 15:31:29','manual',NULL,NULL),(42,1,'2021-05-31 15:31:47','manual',NULL,'00:00:21'),(43,2,'2021-05-31 15:36:24','manual',NULL,'00:00:04'),(44,4,'2021-05-31 15:38:30','manual',NULL,'00:02:33'),(45,1,'2021-05-31 15:41:58','manual',NULL,NULL),(46,2,'2021-05-31 15:41:58','manual',NULL,NULL),(47,3,'2021-05-31 15:41:58','manual',NULL,NULL),(48,4,'2021-05-31 15:41:58','manual',NULL,NULL),(49,1,'2021-05-31 15:42:23','manual',NULL,'00:00:19'),(50,2,'2021-05-31 15:42:23','manual',NULL,'00:00:19'),(51,3,'2021-05-31 15:42:23','manual',NULL,'00:00:19'),(52,4,'2021-05-31 15:42:23','manual',NULL,'00:00:19'),(53,1,'2021-06-01 09:56:12','manual',NULL,'00:00:29'),(54,2,'2021-06-01 09:56:12','manual',NULL,'00:00:29'),(55,3,'2021-06-01 09:56:12','manual',NULL,'00:00:29'),(56,4,'2021-06-01 09:56:12','manual',NULL,'00:00:29'),(57,1,'2021-06-03 14:34:04','manual',NULL,'00:00:28'),(58,2,'2021-06-03 14:34:04','manual',NULL,'00:00:28'),(59,3,'2021-06-03 14:34:04','manual',NULL,'00:00:28'),(60,4,'2021-06-03 14:34:04','manual',NULL,'00:00:28'),(61,4,'2021-06-03 17:17:29','manual',NULL,'00:00:07'),(62,1,'2021-06-09 15:03:01','manual',NULL,NULL),(63,2,'2021-06-09 15:03:01','manual',NULL,NULL),(64,3,'2021-06-09 15:03:01','manual',NULL,NULL),(65,4,'2021-06-09 15:03:01','manual',NULL,NULL),(66,1,'2021-06-09 15:08:41','manual',NULL,NULL),(67,2,'2021-06-09 15:08:41','manual',NULL,NULL),(68,3,'2021-06-09 15:08:41','manual',NULL,NULL),(69,4,'2021-06-09 15:08:41','manual',NULL,NULL),(70,1,'2021-06-11 09:35:07','manual',NULL,NULL),(71,2,'2021-06-11 09:35:07','manual',NULL,NULL),(72,3,'2021-06-11 09:35:07','manual',NULL,NULL),(73,4,'2021-06-11 09:35:07','manual',NULL,NULL),(74,1,'2021-06-11 09:35:36','manual',NULL,'00:00:02'),(75,2,'2021-06-11 09:35:36','manual',NULL,'00:00:02'),(76,3,'2021-06-11 09:35:36','manual',NULL,'00:00:02'),(77,4,'2021-06-11 09:35:36','manual',NULL,'00:00:02'),(78,1,'2021-06-11 09:36:07','manual',NULL,'00:00:02'),(79,2,'2021-06-11 09:36:07','manual',NULL,'00:00:02'),(80,3,'2021-06-11 09:36:07','manual',NULL,'00:00:02'),(81,4,'2021-06-11 09:36:07','manual',NULL,'00:00:02'),(82,1,'2021-06-11 09:36:50','manual',NULL,'00:00:01'),(83,2,'2021-06-11 09:36:50','manual',NULL,'00:00:01'),(84,3,'2021-06-11 09:36:50','manual',NULL,'00:00:01'),(85,4,'2021-06-11 09:36:50','manual',NULL,'00:00:01'),(86,1,'2021-06-15 10:40:43','manual',NULL,NULL),(87,2,'2021-06-15 10:40:43','ww',NULL,NULL),(88,3,'2021-06-15 10:40:43','ee',NULL,NULL),(89,1,'2021-06-15 10:41:27','manual',NULL,NULL),(90,2,'2021-06-15 10:41:27','ww',NULL,NULL),(91,3,'2021-06-15 10:41:27','ee',NULL,NULL);
/*!40000 ALTER TABLE `abnormalities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audio-10/6/2021`
--

DROP TABLE IF EXISTS `audio-10/6/2021`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audio-10/6/2021` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device` int NOT NULL,
  `audioPath` varchar(255) DEFAULT NULL,
  `level` double DEFAULT NULL,
  `class` int DEFAULT NULL,
  `time` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio-10/6/2021`
--

LOCK TABLES `audio-10/6/2021` WRITE;
/*!40000 ALTER TABLE `audio-10/6/2021` DISABLE KEYS */;
INSERT INTO `audio-10/6/2021` VALUES (1,3,'asd',NULL,NULL,'00:23:14'),(2,3,'asd',NULL,NULL,'23:23:14'),(3,3,'asd',0,0,'00:23:14');
/*!40000 ALTER TABLE `audio-10/6/2021` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audio-14/6/2021`
--

DROP TABLE IF EXISTS `audio-14/6/2021`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audio-14/6/2021` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device` int NOT NULL,
  `audioPath` varchar(255) DEFAULT NULL,
  `level` decimal(10,0) DEFAULT NULL,
  `class` int DEFAULT NULL,
  `time` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio-14/6/2021`
--

LOCK TABLES `audio-14/6/2021` WRITE;
/*!40000 ALTER TABLE `audio-14/6/2021` DISABLE KEYS */;
INSERT INTO `audio-14/6/2021` VALUES (1,3,'asd',75,3,'00:23:14'),(2,3,'asd',0,3,'00:23:14');
/*!40000 ALTER TABLE `audio-14/6/2021` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project` int NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  `location` varchar(45) DEFAULT NULL,
  `threshold` decimal(5,0) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,1,1,'22.426, 114.2125',80),(2,1,1,'22.426, 114.2125',100),(3,1,1,'22.426, 114.2125',130),(4,1,1,'22.426, 114.2125',100);
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gps`
--

DROP TABLE IF EXISTS `gps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device` int NOT NULL,
  `time` varchar(20) DEFAULT NULL,
  `location` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gps`
--

LOCK TABLES `gps` WRITE;
/*!40000 ALTER TABLE `gps` DISABLE KEYS */;
INSERT INTO `gps` VALUES (1,1,'2021-05-10 10:00:00',''),(2,3,'2020-03-03 22:34:30','null'),(3,3,'2020-03-03 22:34:30','null'),(4,9,'2020-03-03 22:34:30','null'),(5,5,'2020-03-03 22:34:30','null'),(6,3,'2020-03-03 22:34:30','null'),(7,2,'2020-04-05 23:35:00','wer'),(8,2,'2020-04-05 23:35:00','wer'),(9,1,'2020-04-05 23:35:00','wer'),(10,2,'2020-04-05 23:35:00','wer'),(11,3,'2020-04-05 23:35:00','wer'),(12,1,'2021-06-29 13:26:00','wer'),(13,2,'2020-04-05 23:35:00','wer'),(14,3,'2020-04-05 23:35:00','wer'),(15,1,'2021-06-29 13:44:00','wer'),(16,2,'2020-04-05 23:35:00','wer'),(17,3,'2020-04-05 23:35:00','wer'),(18,1,'2021-06-29 13:44:00',','),(19,2,'2020-04-05 23:35:00','wer'),(20,3,'2020-04-05 23:35:00','wer');
/*!40000 ALTER TABLE `gps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start` date DEFAULT NULL,
  `person` varchar(45) DEFAULT NULL,
  `phone` int DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `deviceCount` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'2020-01-01','Me',NULL,NULL,4);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-07-07 16:02:58
