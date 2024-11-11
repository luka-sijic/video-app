pipeline {
    agent any
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
                sh 'sudo rm -rf /var/www/v1.basedgroup.com/* && sudo mv dist/* /var/www/v1.basedgroup.com'
            }
        }
    }
}
