pipeline {
  agent {
    docker {
      image 'node:16'
      args '-v /home/ec2-user/.npmrc:/home/node/.npmrc:ro'
    }
  }

  stages {
    stage('Build') {
      steps {
        sh '''
npm ci
'''
      }
    }

    stage('Publish') {
      when {
        branch 'master'
      }
      steps {
        sh '''
BASEVERSION=`node -e "var pjson = require('./package.json'); console.log(pjson.version);" | cut -d"." -f1,2`
npm version "$BASEVERSION.$BUILD_NUMBER"
npm publish
'''
      }
    }
  }
}