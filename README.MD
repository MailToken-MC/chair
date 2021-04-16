## chair

Sets up the database and responds to emails

This program requires a mariadb database server running on port 3306, and an account

To create the account you can run this query on your server thorugh root

```sql
CREATE USER 'dbuser'@localhost IDENTIFIED BY 'dbpass';
GRANT ALL PRIVILEGES ON . TO 'dbuser'@localhost IDENTIFIED BY 'dbpass';
```

Configure config.json accordingly

#### install dependencies
```console
npm install
```

#### run
```console
npm start
```

You will need to create the database itself, to do this run this after npm start
```
cleardb
```