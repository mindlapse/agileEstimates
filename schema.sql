create table team (
	teamId      integer auto_increment primary key,
	teamName    varchar(100) not null
)

create table user (
	userId 		integer auto_increment primary key,
	fbId 		varchar(20) not null unique key,

	name 		varchar(128),
	email 		varchar(128),

	first_name  varchar(100),
	last_name   varchar(100),
	locale      varchar(20),
	timezone    varchar(20),

	teamChoice  integer not null default 0 references team(teamId)
);

create table ticket (
	ticketId    integer auto_increment primary key,
	added       timestamp default current_timestamp,
	addedBy     integer not null references user(userId),
	name        varchar(20) not null,
	teamId      integer not null,
	frozen      varchar(1) not null default 'N'
);

create table estimate (
	id          integer auto_increment primary key,
	userId      integer not null references user(userId),
	ticketId    integer not null references ticket(ticketId),
	estimate    float not null
);


insert into team (teamName) values ('Time & Attendance');
insert into team (teamName) values ('Platform');
insert into team (teamName) values ('LFSO');
insert into team (teamName) values ('MVS');
insert into team (teamName) values ('Feature Team');
insert into team (teamName) values ('Mobility');