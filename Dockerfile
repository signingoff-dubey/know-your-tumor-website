# Use Python 3.9 base image
FROM python:3.9-slim

# Install system dependencies required by OpenCV and TensorFlow
RUN apt-get update && apt-get install -y \
    git wget gcc libgl1-mesa-glx libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies with compatible versions
RUN pip install --upgrade pip
RUN pip install numpy==1.22.0 protobuf==3.20.3
RUN pip install -r requirements.txt

# Expose port (Render uses 10000 internally)
EXPOSE 10000

# Start the application with Gunicorn
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:10000"]
