import EscapeString

elifePipeline {
    def commit

    stage 'Checkout', {
        checkout scm
        commit = elifeGitRevision()
    }

    elifeMainlineOnly {
        stage 'Merge to gh-pages', {
            elifeGitMoveToBranch commit, 'gh-pages'
        }

        stage 'Deploy to staging', {
            sh "aws s3 sync --exclude='.git/*' ./ s3://staging-elife-reproducible-document-stack/ --delete"
        }

        stage 'Approval', {
            elifeGitMoveToBranch commit, 'approved'
        }
    }
}
