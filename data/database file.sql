BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "firebaseToken" (
	"if"	INTEGER,
	"token"	TEXT,
	PRIMARY KEY("if" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Images" (
	"id"	INTEGER,
	"Name"	TEXT NOT NULL UNIQUE,
	"image"	BLOB NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "roles" (
	"id"	INTEGER,
	"name"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "registration" (
	"id"	INTEGER,
	"fullName"	TEXT NOT NULL,
	"email"	TEXT NOT NULL UNIQUE,
	"number"	TEXT NOT NULL UNIQUE,
	"userName"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "chat" (
	"id"	INTEGER,
	"userId"	INTEGER NOT NULL,
	"userName"	TEXT,
	"userRole"	INTEGER,
	"text"	TEXT,
	"image"	BLOB,
	"video"	BLOB,
	"audio"	BLOB,
	"document"	BLOB,
	"resolution"	TEXT,
	"createAt"	TEXT,
	"otherUserId"	INTEGER,
	"otherUserName"	TEXT,
	"otherUserRole"	INTEGER,
	"systemMessage"	TEXT,
	"postLink"	TEXT,
	FOREIGN KEY("userRole") REFERENCES "roles"("id"),
	FOREIGN KEY("otherUserRole") REFERENCES "roles"("id"),
	FOREIGN KEY("userId") REFERENCES "userDetails"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "savedPosts" (
	"id"	INTEGER,
	"postId"	INTEGER,
	"userId"	INTEGER,
	"createdAt"	TEXT,
	FOREIGN KEY("userId") REFERENCES "userDetails"("id"),
	FOREIGN KEY("postId") REFERENCES "designerPost"("postId") ON DELETE CASCADE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "likes" (
	"id"	INTEGER,
	"postId"	INTEGER,
	"userId"	INTEGER,
	"createdAt"	TEXT,
	FOREIGN KEY("userId") REFERENCES "userDetails"("id"),
	FOREIGN KEY("postId") REFERENCES "designerPost"("postId") ON DELETE CASCADE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "comments" (
	"commentId"	INTEGER,
	"designerId"	INTEGER,
	"postSId"	INTEGER,
	"comment"	TEXT,
	"createdAt"	INTEGER,
	"userName"	TEXT,
	"userLogo"	BLOB,
	FOREIGN KEY("postSId") REFERENCES "designerPost"("postId"),
	FOREIGN KEY("designerId") REFERENCES "userDetails"("id"),
	PRIMARY KEY("commentId" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "follows" (
	"followId"	INTEGER,
	"followingId"	INTEGER,
	"followerId"	INTEGER,
	"createdAt"	INTEGER,
	PRIMARY KEY("followId" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "designerDetails" (
	"id"	INTEGER,
	"socketId"	TEXT,
	"fullName"	TEXT,
	"email"	TEXT,
	"mobileNumber"	TEXT,
	"userRole"	INTEGER,
	"userLogo"	BLOB,
	"posts"	INTEGER,
	"following"	INTEGER,
	"followers"	INTEGER,
	FOREIGN KEY("userRole") REFERENCES "roles"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "property_details" (
	"id"	INTEGER,
	"userId"	INTEGER,
	"propertyType"	TEXT,
	"projectType"	TEXT,
	"property"	TEXT,
	"occupancy"	TEXT,
	"area"	TEXT,
	"city"	TEXT,
	"community"	TEXT,
	"buildersProject"	TEXT,
	"unitType"	TEXT,
	"minBudget"	TEXT,
	"maxBudget"	TEXT,
	"propertySize"	TEXT,
	"propertySizeUnits"	TEXT,
	"startDate"	TEXT,
	"endDate"	TEXT,
	FOREIGN KEY("userId") REFERENCES "userDetails"("id") ON DELETE CASCADE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "projects" (
	"projectId"	INTEGER,
	"userId"	INTEGER,
	"designerId"	INTEGER,
	"name"	TEXT,
	"status"	TEXT,
	"propertyId"	INTEGER,
	"thumbnail"	TEXT,
	"percentage"	INTEGER,
	"createdAt"	INTEGER,
	"budget"	INTEGER,
	FOREIGN KEY("designerId") REFERENCES "designerDetails"("id"),
	FOREIGN KEY("propertyId") REFERENCES "property_details"("id"),
	FOREIGN KEY("userId") REFERENCES "userDetails"("id"),
	PRIMARY KEY("projectId" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "userDetails" (
	"id"	INTEGER,
	"socketId"	TEXT,
	"fullName"	TEXT,
	"email"	TEXT,
	"mobileNumber"	TEXT,
	"userRole"	INTEGER,
	"userLogo"	BLOB,
	"following"	INTEGER,
	"likes"	INTEGER,
	"saved"	INTEGER,
	"gender"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "vendorDetails" (
	"vendorId"	INTEGER,
	"vendorName"	TEXT NOT NULL,
	"mobileNumber"	INTEGER NOT NULL UNIQUE,
	"email"	TEXT NOT NULL UNIQUE,
	"Address"	TEXT NOT NULL,
	"vendor Type"	TEXT,
	"area"	TEXT,
	"city"	TEXT,
	"BankName"	TEXT,
	"Account Number"	INTEGER,
	"GSTNo"	TEXT,
	"teamSize"	INTEGER,
	PRIMARY KEY("vendorId")
);
CREATE TABLE IF NOT EXISTS "vendorServices" (
	"servicesId"	INTEGER,
	"vendorId"	INTEGER NOT NULL,
	"serviceName"	TEXT,
	FOREIGN KEY("vendorId") REFERENCES "vendorDetails"("vendorId"),
	PRIMARY KEY("servicesId" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "projectServices" (
	"id"	INTEGER,
	"serviceId"	INTEGER NOT NULL,
	"projectId"	INTEGER NOT NULL,
	"image"	BLOB,
	"createdAt"	INTEGER,
	FOREIGN KEY("projectId") REFERENCES "projects"("projectId"),
	FOREIGN KEY("serviceId") REFERENCES "vendorServices"("servicesId"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "payments" (
	"id"	INTEGER,
	"project_id"	INTEGER NOT NULL,
	"user_id"	INTEGER NOT NULL,
	"amount"	INTEGER NOT NULL,
	"createdAt"	INTEGER NOT NULL,
	FOREIGN KEY("project_id") REFERENCES "projects"("projectId"),
	FOREIGN KEY("user_id") REFERENCES "userDetails"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "catalogs" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"thumbnail"	BLOB,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "user_catalogs" (
	"id"	INTEGER,
	"userId"	INTEGER NOT NULL,
	"catalogId"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "designerPost" (
	"postId"	INTEGER,
	"designerId"	INTEGER,
	"postType"	TEXT,
	"designStyle"	TEXT,
	"category"	TEXT,
	"subCategory"	TEXT,
	"caption"	TEXT,
	"privacy"	TEXT,
	"likes"	INTEGER,
	"thumbnail"	INTEGER,
	"isActive"	BLOB,
	"createdAt"	INTEGER,
	"updatedAt"	INTEGER,
	"location"	TEXT,
	"occupancy"	TEXT,
	"propertySize"	TEXT,
	"duration"	TEXT,
	"tags"	TEXT,
	"designerName"	TEXT,
	"logo"	BLOB,
	"tourId"	INTEGER,
	"catalog"	INTEGER,
	PRIMARY KEY("postId" AUTOINCREMENT)
);

INSERT INTO "roles" ("id","name") VALUES (1,'users'),
 (2,'interior_designers');
INSERT INTO "registration" ("id","fullName","email","number","userName","password") VALUES (3,'Rushendra Sai Vutukuri','rushivutukuri@gmail.com','7995329943','Rushi1234','$2b$10$Ov3/fzP2gapUmBwZ.nBPtuzEIgI9hxrkQHmeoX4ANsUWFVnKBcOga'),
 (4,'Rushi Vutukuri','rushindrasaiv@gmail.com','9258043761','Rushi4321','$2b$10$8Z.UsjYFHXyYOwJZAOEIw.dT6JOf6TnyFrrtzx5GCyijW5T15Fao6');
INSERT INTO "chat" ("id","userId","userName","userRole","text","image","video","audio","document","resolution","createAt","otherUserId","otherUserName","otherUserRole","systemMessage","postLink") VALUES (1,1,'Rushendra Sai Vutukuri',1,'Hi',NULL,NULL,NULL,NULL,NULL,'1721300522161.0',2,'Rushi Vutukuri',2,'false',NULL),
 (2,2,'Rushi Vutukuri',2,'Hi',NULL,NULL,NULL,NULL,NULL,'1721300522162.0',1,'Rushendra Sai Vutukuri',1,'false',NULL),
 (3,1,'Rushendra Sai Vutukuri',1,'hi',NULL,NULL,NULL,NULL,NULL,'1721306036339.0',2,'Rushi Vutukuri',2,'false',NULL),
 (4,1,'Rushendra Sai Vutukuri',1,'hi',NULL,NULL,NULL,NULL,NULL,'1721307728758.0',2,'Rushi Vutukuri',2,'false',NULL),
 (5,2,'Rushi Vutukuri',2,'hi',NULL,NULL,NULL,NULL,NULL,'1721363520912.0',1,'Rushendra Sai Vutukuri',1,'false',NULL),
 (7,1,'Rushendra Sai Vutukuri',1,'hi',NULL,NULL,NULL,NULL,NULL,'1721366131176.0',2,'Rushi Vutukuri',2,'false',NULL),
 (11,2,'Rushi Vutukuri',2,'hi',NULL,NULL,NULL,NULL,NULL,'1721367176433.0',1,'Rushendra Sai Vutukuri',1,'false',NULL),
 (12,2,'Rushi Vutukuri',2,'hi',NULL,NULL,NULL,NULL,NULL,'1721367791135.0',1,'Rushendra Sai Vutukuri',1,'false',NULL),
 (13,1,'Rushendra Sai Vutukuri',1,'hi',NULL,NULL,NULL,NULL,NULL,'1721367812527.0',2,'Rushi Vutukuri',2,'false',NULL),
 (14,2,'Rushi Vutukuri',2,'hi',NULL,NULL,NULL,NULL,NULL,'1721367841766.0',1,'Rushendra Sai Vutukuri',1,'false',NULL),
 (15,1,'Rushendra Sai Vutukuri',1,'hi',NULL,NULL,NULL,NULL,NULL,'1721367850910.0',2,'Rushi Vutukuri',2,'false',NULL),
 (16,1,'Rushendra Sai Vutukuri',1,'hi',NULL,NULL,NULL,NULL,NULL,'1721368042735.0',2,'Rushi Vutukuri',2,'false',NULL),
 (17,2,'Rushi Vutukuri',2,'hi',NULL,NULL,NULL,NULL,NULL,'1721369913355.0',1,'Rushendra Sai Vutukuri',1,'false',NULL),
 (21,1,'Rushendra Sai Vutukuri',1,'lorem ipsum dolloe enit sdasd sdweqwerrt asdawerscad asda',NULL,NULL,NULL,NULL,NULL,'1721382150844.0',2,'Rushi Vutukuri',2,'false',NULL),
 (22,2,'Rushi Vutukuri',2,'asda asdwekj khuiokjb kjlom jhbhjiopklm hgyjklkjnkjlkjnjk',NULL,NULL,NULL,NULL,NULL,'1721382173241.0',1,'Rushendra Sai Vutukuri',1,'false',NULL),
 (26,2,'Rushi Vutukuri',2,'Gddg',NULL,NULL,NULL,NULL,NULL,'1721459804142.0',1,'Rushendra Sai Vutukuri',1,'false',NULL),
 (67,1,'Rushendra Sai Vutukuri',1,NULL,NULL,'videos/1000428538.mp4',NULL,NULL,'480 x 864','1722245904119.0',2,'Rushi Vutukuri',2,'false',NULL),
 (80,1,'Rushendra Sai Vutukuri',1,NULL,'images/1000428801.jpg',NULL,NULL,NULL,'4624 x 2080','1722256597484.0',2,'Rushi Vutukuri',2,'false',NULL),
 (82,1,'Rushendra Sai Vutukuri',1,NULL,'images/1000429077.jpg',NULL,NULL,NULL,'738 x 1600','1722416679066.0',2,'Rushi Vutukuri',2,'false',NULL),
 (83,1,'Rushendra Sai Vutukuri',1,NULL,'images/1000427237.jpg',NULL,NULL,NULL,'1024 x 726','1722417248950.0',2,'Rushi Vutukuri',2,'false',NULL),
 (84,1,'Rushendra Sai Vutukuri',1,NULL,NULL,'videos/1000428286.mp4',NULL,NULL,'1280 x 720','1722487446931.0',2,'Rushi Vutukuri',2,'false',NULL),
 (85,1,'Rushendra Sai Vutukuri',1,NULL,NULL,'videos/1000428286.mp4',NULL,NULL,'1280 x 720','1722487611429.0',2,'Rushi Vutukuri',2,'false',NULL),
 (86,1,'Rushendra Sai Vutukuri',1,NULL,NULL,'videos/1000428274.mp4',NULL,NULL,'720 x 1280','1722487703859.0',2,'Rushi Vutukuri',2,'false',NULL),
 (100,1,'Rushendra Sai Vutukuri',1,'asd',NULL,NULL,NULL,NULL,NULL,'1733138867622.0',2,'Rushi Vutukuri',2,'false',NULL),
 (101,1,'Rushendra Sai Vutukuri',1,'a',NULL,NULL,NULL,NULL,NULL,'1733138871261.0',2,'Rushi Vutukuri',2,'false',NULL),
 (102,1,'ABCD',2,'Hi',NULL,NULL,NULL,NULL,NULL,'1722316229286',1,'Rushendra Sai Vutukuri',1,'false',NULL),
 (103,1,'Rushendra Sai Vutukuri',1,'d',NULL,NULL,NULL,NULL,'','1733139682952.0',1,'ABCD',2,'false',NULL),
 (104,1,'Rushendra Sai Vutukuri',1,'sdf',NULL,NULL,NULL,NULL,NULL,'1733142817669.0',2,'Rushi Vutukuri',2,'false',NULL);
INSERT INTO "savedPosts" ("id","postId","userId","createdAt") VALUES (32,5,3,'1723291036564.0'),
 (33,6,3,'1723291039582.0'),
 (40,1,3,'1724930671776.0'),
 (42,2,1,'1726291328429.0'),
 (43,NULL,1,'1730093948817.0');
INSERT INTO "likes" ("id","postId","userId","createdAt") VALUES (354,3,1,'1730800407685.0'),
 (377,1,1,'1732771112200.0'),
 (378,2,1,'1733287882930.0');
INSERT INTO "comments" ("commentId","designerId","postSId","comment","createdAt","userName","userLogo") VALUES (1,2,3,'Great design! I love the color scheme.',1690980000000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (2,2,1,'This is a very creative approach.',1690980001000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (3,2,11,'I like the use of space in this design.',1690980002000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (4,2,5,'The typography is excellent.',1690980003000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (5,2,8,'This layout is very user-friendly.',1690980004000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (6,2,7,'Nice choice of images.',1690980005000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (7,2,2,'The design is modern and clean.',1690980006000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (8,2,10,'Great work with the animations!',1690980007000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (9,2,4,'This design feels very fresh.',1690980008000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (10,2,6,'I love the contrast in this design.',1690980009000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (11,2,9,'The color palette is perfect.',1690980010000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (12,2,3,'Great attention to detail.',1690980011000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (13,2,11,'The icons used here are very intuitive.',1690980012000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (14,2,2,'This is a very engaging design.',1690980013000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (15,2,8,'I appreciate the minimalistic approach.',1690980014000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (16,2,1,'The layout is very balanced.',1690980015000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (17,2,7,'Great use of negative space.',1690980016000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (18,2,5,'This design is visually appealing.',1690980017000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (19,2,4,'I like the color gradients.',1690980018000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (20,2,9,'This is a very dynamic design.',1690980019000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (21,2,6,'The design is very sleek and professional.',1690980020000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (22,2,10,'The imagery is very impactful.',1690980021000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (23,2,1,'Great visual hierarchy.',1690980022000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (24,2,5,'This design is very inviting.',1690980023000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (25,2,2,'The use of textures is interesting.',1690980024000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (26,2,11,'This design is very cohesive.',1690980025000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (27,2,3,'I like the use of bold colors.',1690980026000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (28,2,8,'The typography is very readable.',1690980027000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (29,2,6,'The layout is very intuitive.',1690980028000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (30,2,4,'This design has a great flow.',1690980029000,'Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (31,2,7,'The visual elements are well-aligned.',1690980030000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (32,2,10,'I love the use of illustrations.',1690980031000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (33,2,9,'This design is very user-centric.',1690980032000,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (34,2,1,'Hi',1723008950667,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (35,2,1,'Hi',1723008956505,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (36,2,1,'Hi',1723009146312,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (37,2,1,'Hi',1723009152108,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (38,2,2,'Hi',1723009163111,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (39,2,1,'Hi',1724134942690,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (40,2,1,'Hi',1724134947732,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg'),
 (41,2,1,'Welcome ',1725280892171,'Rushendra Sai Vutukuri',NULL),
 (42,2,3,'Hi',1726291382814,'Rushendra Sai Vutukuri',NULL),
 (43,2,1,'hi',1730184259989,'Rushendra Sai Vutukuri',NULL),
 (44,2,1,'H',1730190743574,'Rushendra Sai Vutukuri','uploads/userProfilePicture.jpg');
INSERT INTO "follows" ("followId","followingId","followerId","createdAt") VALUES (2,2,1,1723457142000),
 (6,1,2,1733289047973),
 (7,1,1,1733289077904);
INSERT INTO "designerDetails" ("id","socketId","fullName","email","mobileNumber","userRole","userLogo","posts","following","followers") VALUES (1,'Dn2WmUua1gL-AbGsAAA9','ABCD','ABCD@gmail.com','9988776655',2,'uploads/user.jpg',10,20,5),
 (2,'-ZsbK7VuXqUf2Ep9AAAU','Rushi Vutukuri','rushindrasaiv@gmail.com','9258043761',2,'uploads/user.jpg',11,300,50);
INSERT INTO "property_details" ("id","userId","propertyType","projectType","property","occupancy","area","city","community","buildersProject","unitType","minBudget","maxBudget","propertySize","propertySizeUnits","startDate","endDate") VALUES (6,1,'Residential','Space Planning and Furniture Selection','2 BHK','Vacate','Kphb','Hyderabad ','Adagutta','None',NULL,'500000','550000','5000','sq.feet','13/08/2024','25/08/2024'),
 (7,1,'Commercial','Retail Design',NULL,NULL,NULL,NULL,NULL,NULL,'Office Space','500000','550000','3000','sq.feet','21/08/2024','31/08/2024');
INSERT INTO "projects" ("projectId","userId","designerId","name","status","propertyId","thumbnail","percentage","createdAt","budget") VALUES (1,1,2,'Project 1','Ongoing',6,'feedUploads/thumbnail.jpg',70,1732769685000,500000);
INSERT INTO "userDetails" ("id","socketId","fullName","email","mobileNumber","userRole","userLogo","following","likes","saved","gender") VALUES (1,'Dn2WmUua1gL-AbGsAAA9','Rushendra Sai Vutukuri','rushivutukuri@gmail.com','7995329943',1,'images/7275df39-cc16-4193-8344-e9984b476793.jpeg',10,50,30,'Male'),
 (3,'pEnF7Gu6COTQyn8-AAAP','Sai Vutukuri','rushendrasaiv@gmail.com','9876543210',1,'uploads/userProfilePicture.jpg',30,65,22,'Male'),
 (6,'ujGxchAi40kv4TA2AAAn','RSV ','rsv2255@gmail.com','9852340167',1,'uploads/userProfilePicture.jpg',50,32,0,'Male');
INSERT INTO "vendorDetails" ("vendorId","vendorName","mobileNumber","email","Address","vendor Type","area","city","BankName","Account Number","GSTNo","teamSize") VALUES (1,'RSV',9517324680,'rsv@gmail.com','187/C - Adagutta Society','Service Based','KPHB','Hyderabad','Union Bank of India',42010100187485,NULL,25),
 (2,'Sai Rocky',9578213460,'saiRocky@gmail.com','5-20 - Raji reddy Nagar','Product Based','NizamPet','Hyderabad','HDFC Bank',4201306050488,NULL,20);
INSERT INTO "vendorServices" ("servicesId","vendorId","serviceName") VALUES (1,1,'Flooring'),
 (2,1,'Painting'),
 (3,1,'Ceiling'),
 (4,1,'Plumbing'),
 (5,1,'Wood work'),
 (6,1,'Tiles'),
 (7,1,'Wallpapers'),
 (8,1,'Decor'),
 (9,1,'Home Automation');
INSERT INTO "projectServices" ("id","serviceId","projectId","image","createdAt") VALUES (1,7,1,NULL,1731580479000),
 (2,1,1,NULL,1731580672000),
 (3,3,1,NULL,1731580492000),
 (4,7,1,NULL,1731602272000),
 (5,3,1,NULL,1731688672000),
 (6,7,1,NULL,1731666600000),
 (7,7,1,NULL,1731688200000);
INSERT INTO "payments" ("id","project_id","user_id","amount","createdAt") VALUES (1,1,1,250000,1732791878000),
 (2,1,1,125000,1731495878000),
 (3,1,1,75000,1730631878000),
 (4,1,1,50000,1730199878000);
INSERT INTO "catalogs" ("id","name","thumbnail") VALUES (1,'Modern','https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?cs=srgb&dl=pexels-vecislavas-popa-1571460.jpg&fm=jpg'),
 (2,'Traditional','https://www.decorilla.com/online-decorating/wp-content/uploads/2018/10/modern-interior-design-grey-living-room2.png'),
 (3,'Contemporary','https://images.livspace-cdn.com/plain/https://jumanji.livspace-cdn.com/magazine/wp-content/uploads/sites/2/2018/12/22103134/Cover-1.jpg'),
 (4,'Transitional','https://media.designcafe.com/wp-content/uploads/2022/08/25190515/interior-design-cost-in-bangalore.jpg'),
 (5,'Beach','https://media.designcafe.com/wp-content/uploads/2020/02/21005335/interior-design-ideas-for-hall.jpg'),
 (6,'Mid Century','http://cdn.home-designing.com/wp-content/uploads/2019/04/living-room-pendant-light.jpg'),
 (7,'Nautical','https://images.homify.com/c_fill,f_auto,q_0,w_740/v1495001963/p/photo/image/2013905/CAM_2_OPTION_1.jpg'),
 (8,'Mediterranean','https://goodhomes.wwmindia.com/content/2022/jun/infusing-wood-in-this-neutral-themed-home.jpg');
INSERT INTO "user_catalogs" ("id","userId","catalogId") VALUES (1,1,1),
 (9,1,4),
 (10,1,5),
 (12,1,2);
INSERT INTO "designerPost" ("postId","designerId","postType","designStyle","category","subCategory","caption","privacy","likes","thumbnail","isActive","createdAt","updatedAt","location","occupancy","propertySize","duration","tags","designerName","logo","tourId","catalog") VALUES (1,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',1,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta, Hyderabad','2 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,1),
 (2,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',1,'feedUploads/interior-design.jpg',NULL,1732256431000,NULL,'punjagutta','3 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,4),
 (3,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',1,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta, Hyderabad','2 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,2),
 (4,1,'image',NULL,'Commercial',NULL,'Latest Interior Designers','public',0,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta, Hyderabad','3 BHK','35','15 Days','#Dining#interiordesign#3bhk','ABCD','uploads/user.jpg',NULL,6),
 (5,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',0,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta','2 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,4),
 (6,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',0,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta, Hyderabad','2 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,8),
 (7,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',0,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta, Hyderabad','2 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,6),
 (8,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',0,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta','3 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,5),
 (9,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',0,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta, Hyderabad','2 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,1),
 (10,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',0,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta, Hyderabad','2 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,3),
 (11,2,'image',NULL,'Residential',NULL,'Latest Interior Designers','public',0,'feedUploads/interior-design.jpg',NULL,1722597918000,NULL,'punjagutta, Hyderabad','2 BHK','35','15 Days','#Dining#interiordesign','Rushi Vutukuri','uploads/user.jpg',NULL,2),
 (12,2,'video',NULL,'Commercial',NULL,'Latest Interior Designers','public',0,'videos/1000428538.mp4',NULL,1722597918000,NULL,'punjagutta, Hyderabad','2 BHK','800','12 Days','#residentialhouses','Rushi Vutukuri','uploads/user.jpg',NULL,4);

CREATE TRIGGER after_like_delete
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
  UPDATE designerPost
  SET likes = likes - 1
  WHERE postId = OLD.postId;
END;
CREATE TRIGGER after_like_delete_user_details
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
  UPDATE userDetails
  SET likes = likes - 1
  WHERE id = OLD.userId;
END;
CREATE TRIGGER after_like_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
  UPDATE designerPost
  SET likes = likes + 1
  WHERE postId = NEW.postId;
END;
CREATE TRIGGER after_like_insert_user_details
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
  UPDATE userDetails
  SET likes = likes + 1
  WHERE id = NEW.userId;
END;
COMMIT;
