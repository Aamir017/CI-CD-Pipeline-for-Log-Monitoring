pipeline {
  agent any

  environment {
    IMAGE = "aamir017/log-monitor"            // DockerHub repo
    DOCKER_CREDS_ID = "dockerhub-creds"       // Jenkins credentials (username/password)
    PUSH_LATEST = true                        // change to false if you don't want 'latest'
  }



  stages {
    stage('Checkout') {
      steps { 
        checkout scm 
      }
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

    // 🔹 New stage: DAST Scan with OWASP ZAP
    stage('DAST - OWASP ZAP Baseline') {
      steps {
        sh '''
          set -eux
          mkdir -p reports && rm -f reports/zap_*

          # Create a network so app + zap can talk
          docker network create zapnet || true

          # Run the app container
          docker rm -f app-under-test || true
          docker run -d --name app-under-test --network zapnet -p 3000:3000 ${IMAGE}:${IMAGE_TAG}

          # Wait for app to be up
          for i in $(seq 1 30); do
            if docker run --rm --network zapnet curlimages/curl -fsS http://app-under-test:3000/ > /dev/null; then
              echo "App is up"
              break
            fi
            echo "Waiting for app..."
            sleep 2
          done

          # Run ZAP Baseline Scan
          docker run --rm --network zapnet \
            -v "$PWD/reports:/zap/wrk:rw" \
            ghcr.io/zaproxy/zaproxy:stable \
            zap-baseline.py \
              -t http://app-under-test:3000 \
              -r /zap/wrk/zap_report.html \
              -J /zap/wrk/zap_report.json \
              -w /zap/wrk/zap_report.md \
              -m 2 -a -s

          EXIT=$?
          echo "ZAP exit code: $EXIT"
          # Fail build on FAIL (1) or error (3)
          if [ "$EXIT" -eq 1 ] || [ "$EXIT" -eq 3 ]; then
            echo "❌ DAST scan found issues"
            exit 1
          fi
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/zap_report.*', allowEmptyArchive: true
          sh 'docker rm -f app-under-test || true'
          sh 'docker network rm zapnet || true'
        }
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
  }

  post {
    success { echo "✅ Pipeline succeeded: ${IMAGE}:${IMAGE_TAG}" }
    failure { echo "❌ Pipeline failed" }
  }
}
