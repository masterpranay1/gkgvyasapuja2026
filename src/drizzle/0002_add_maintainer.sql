CREATE TABLE "maintainer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"login_id" varchar(64) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"label" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "maintainer_login_id_unique" UNIQUE("login_id")
);
