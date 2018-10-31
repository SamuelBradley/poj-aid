pipeline {
    agent {
      any
    }
    stages {
      stage('Build Image') {
        steps {
          def customImage = docker.build("pojaid:${env.BUILD_ID}")
          customImage.push()
          customImage.push('latest')
        }
      }
    }
}