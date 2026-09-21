pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'lambao12122004/ktx-frontend:latest'
        CONTAINER_NAME = 'ktx-frontend-container'
    }

    stages {
        // =========================================================
        // Stage 1: Build Docker Image Frontend
        // Chỉ chạy trên branch main
        // =========================================================
        stage('Build') {
            when {
                branch 'main'
            }

            steps {
                withCredentials([
                    string(
                        credentialsId: 'vite-api-url',
                        variable: 'VITE_API_BASE_URL'
                    )
                ]) {
                    bat """
                        docker build ^
                        --build-arg VITE_API_BASE_URL="%VITE_API_BASE_URL%" ^
                        -t %DOCKER_IMAGE% ./ktx-frontend
                    """
                }
            }
        }

        // =========================================================
        // Stage 2: Push Image Frontend lên Docker Hub
        // Chỉ chạy trên branch main
        // =========================================================
        stage('Push') {
            when {
                branch 'main'
            }

            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    bat """
                        echo %DOCKER_PASS% | docker login ^
                        --username %DOCKER_USER% ^
                        --password-stdin

                        docker push %DOCKER_IMAGE%
                    """
                }
            }
        }

        // =========================================================
        // Stage 3: Deploy Frontend lên VPS
        // Chỉ chạy trên branch main
        // =========================================================
        stage('Deploy') {
            when {
                branch 'main'
            }

            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'vps-ssh-credentials',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    ),
                    string(
                        credentialsId: 'vps-host',
                        variable: 'VPS_HOST'
                    )
                ]) {
                    /*
                     * Pull image frontend mới
                     * Stop + remove container frontend cũ
                     * Run container frontend mới (Port 5173)
                     */
                    bat """
                        ssh -o StrictHostKeyChecking=no ^
                        -i "%SSH_KEY%" ^
                        %SSH_USER%@%VPS_HOST% ^
                        "docker pull %DOCKER_IMAGE% && ^
                         docker stop %CONTAINER_NAME% 2>/dev/null || true; ^
                         docker rm %CONTAINER_NAME% 2>/dev/null || true; ^
                         docker run -d ^
                         --name %CONTAINER_NAME% ^
                         -p 5173:5173 ^
                         --restart unless-stopped ^
                         %DOCKER_IMAGE%"
                    """
                }
            }
        }
    }

    post {
        always {
            bat """
                docker logout
            """
        }
    }
}

