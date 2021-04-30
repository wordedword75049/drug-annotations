import os

import psycopg2

db_host = os.environ.get("DB_HOST", "dev-3.dev.bostongene.internal")
db_name = os.environ.get("DB_NAME", "drug-annotations")
db_username = os.environ.get("DB_USERNAME", "postgres")
db_password = os.environ.get("DB_PASSWORD", "12345")
conn_string = f"host='{db_host}' dbname='{db_name}' user='{db_username}' password='{db_password}'"
print('Connecting to candidates database')
conn = psycopg2.connect(conn_string)
print('Connected!')
curs = conn.cursor()

curs.execute(f"""select * from candidates limit 1""")
check_list = curs.fetchone()
print(check_list)
