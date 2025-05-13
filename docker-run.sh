#!/bin/bash

# Script to help with Docker operations for Yad2 Bot

# Function to display help message
show_help() {
  echo "Yad2 Bot Docker Helper Script"
  echo ""
  echo "Usage: ./docker-run.sh [command]"
  echo ""
  echo "Commands:"
  echo "  setup    - Create .env file from template and prepare environment"
  echo "  build    - Build the Docker image"
  echo "  start    - Start the containers with docker-compose"
  echo "  stop     - Stop the containers"
  echo "  logs     - Show container logs"
  echo "  restart  - Restart the containers"
  echo "  clean    - Remove containers, images, and volumes"
  echo "  help     - Show this help message"
  echo ""
}

# Check if .env file exists
check_env_file() {
  if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env_template.txt .env
    echo "Please edit the .env file with your values before starting the containers."
    echo "You can edit it with: nano .env"
    exit 1
  fi
}

# Main script logic
case "$1" in
  setup)
    if [ ! -f .env ]; then
      cp env_template.txt .env
      echo "Created .env file from template."
      echo "Please edit the .env file with your values: nano .env"
    else
      echo ".env file already exists."
    fi
    ;;
  build)
    docker-compose build
    ;;
  start)
    check_env_file
    docker-compose up -d
    echo "Containers started in background. Use './docker-run.sh logs' to see logs."
    ;;
  stop)
    docker-compose down
    echo "Containers stopped."
    ;;
  logs)
    docker-compose logs -f
    ;;
  restart)
    docker-compose restart
    echo "Containers restarted."
    ;;
  clean)
    docker-compose down -v --rmi local
    echo "Containers, images, and volumes removed."
    ;;
  help|*)
    show_help
    ;;
esac