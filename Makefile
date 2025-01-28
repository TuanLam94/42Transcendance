create_dirs:
				@mkdir -p ~/data/db

up:				create_dirs
				docker-compose up -d --build

down:
				docker-compose down

start:
				docker-compose start

stop:
				docker-compose stop

restart:
				docker-compose restart

reset_db:
				docker-compose down -v
				docker run --rm -v /tmp/:/app -w /app alpine rm -rf data
