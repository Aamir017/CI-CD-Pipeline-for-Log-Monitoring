pipeline {
  agent any

  environment {
    IMAGE = "aamir017/log-monitor"            // DockerHub repo
    DOCKER_CREDS_ID = "dockerhub-creds"       // Jenkins credentials (username/password)
    KUBECONFIG_CRED_ID = "kubeconfig"         // Jenkins credentials (Secret File)
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

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: "${KUBECONFIG_CRED_ID}", variable: 'KUBECONFIG_FILE')]) {
          sh """
            export KUBECONFIG=${KUBECONFIG_FILE}
            if kubectl get deployment log-monitor >/dev/null 2>&1; then
              kubectl set image deployment/log-monitor log-monitor=${IMAGE}:${IMAGE_TAG} --record
            else
              kubectl apply -f k8s/
            fi
            kubectl rollout status deployment/log-monitor --timeout=120s || {
              echo "Rollout failed. Checking logs..."
              kubectl describe deployment log-monitor
              kubectl logs -l app=log-monitor --tail=50
              exit 1
            }
          """
        }
      }
    }
  }

  post {
    success { echo "✅ Pipeline succeeded: ${IMAGE}:${IMAGE_TAG}" }
    failure { echo "❌ Pipeline failed" }
  }
}
