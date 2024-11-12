pipeline {
    agent any
    environment {
        DATABASE_URL = credentials('database_url_credential_id')
        REDIS_ADDR = credentials('redis_addr_credential_id')
        REDIS_PASS = credentials('redis_pw_credential_id')
    	JWT_TOKEN = credentials('jwt_token_credential')
    }
    stages {
        stage('Build Backend') {
            steps {
                // Navigate to backend folder, build Go app
                sh 'cd backend && go build -o video main.go'
            }
        }
        stage('Deploy Backend') {
            steps {
                // Transfer executable and restart service
                sh 'sudo systemctl restart video.service'
            }
        }
        stage('Build Frontend') {
            steps {
                // Navigate to frontend folder, install dependencies, and build
                sh 'cd frontend && npm install && npm run build'
            }
        }
        stage('Deploy Frontend') {
            steps {
                // Transfer built frontend files
                sh 'ls ${WORKSPACE}'
                sh 'sudo rm -rf /var/www/v1.basedgroup.com/* && sudo mv ${WORKSPACE}/frontend/dist/* /var/www/v1.basedgroup.com'
            }
        }
    }
}
