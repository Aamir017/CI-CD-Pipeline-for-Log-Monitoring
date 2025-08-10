pipeline {
  agent any

  environment {
    IMAGE = "aamir017/log-monitor"            // DockerHub repo
    DOCKER_CREDS_ID = "dockerhub-creds"       // Jenkins credentials (username/password)
    PUSH_LATEST = true                        // change to false if you don't want 'latest'
  }

  options {
    timestamps()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '50'))
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Set Build Variables') {
      steps {
        script {
          COMMIT_HASH = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          IMAGE_TAG = "${env.BUILD_NUMBER}-${COMMIT_HASH}"
          env.IMAGE_TAG = IMAGE_TAG
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        sh """
          docker build \
            --pull \
            --no-cache \
            -t ${IMAGE}:${IMAGE_TAG} .
        """
      }
    }

    stage('Test (Optional)') {
      steps {
        echo "Run tests here (unit/integration) if available."
      }
    }

    stage('Push to DockerHub') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh """
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push ${IMAGE}:${IMAGE_TAG}
            if [ "${PUSH_LATEST}" = "true" ]; then
              docker tag ${IMAGE}:${IMAGE_TAG} ${IMAGE}:latest
              docker push ${IMAGE}:latest
            fi
          """
        }
      }
    }


  post {
    success { echo "✅ Pipeline succeeded: ${IMAGE}:${IMAGE_TAG}" }
    failure { echo "❌ Pipeline failed" }
  }
}
