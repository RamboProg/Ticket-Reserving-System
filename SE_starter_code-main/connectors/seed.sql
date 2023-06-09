-- Insert Roles
INSERT INTO se_project.roles("role")
	VALUES ('user');
INSERT INTO se_project.roles("role")
	VALUES ('admin');
INSERT INTO se_project.roles("role")
	VALUES ('senior');	
-- Set user role as Admin
UPDATE se_project.users
	SET "roleId"=2
	WHERE "email"='desoukya@gmail.com';
	
-- Insert Zones
INSERT INTO se_project.zones("zonetype","price")
	VALUES ('9 stations', 100);
INSERT INTO se_project.zones("zonetype","price")
	VALUES ('10-16 stations', 150);
INSERT INTO se_project.zones("zonetype","price")
	VALUES ('16+ stations', 200);

-- Insert Subscriptions
INSERT INTO se_project.subsription("subtype","zoneid","userid","nooftickets")
	VALUES ('annual',1,1,10);

INSERT INTO se_project.subsription("subtype","zoneid","userid","nooftickets")
	VALUES ('monthly',2,1,12);

INSERT INTO se_project.subsription("subtype","zoneid","userid","nooftickets")
	VALUES ('quarterly',3,1,15);