FROM python:3.8
WORKDIR /backend

COPY requirements.txt /backend/
RUN pip3 install -r requirements.txt --no-cache-dir

COPY . /backend/
CMD gunicorn --bind 0.0.0.0:5000 app:app

EXPOSE 5000
