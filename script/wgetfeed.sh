wget --quiet --auth-no-challenge -O $JIRA_DASHBOARD_HOME/data/feed.json --user=$JIRA_USERNAME --password=$JIRA_PWD "$JIRA_URL?jql=project+=+$JIRA_PROJECT_NAME+AND+Sprint+IN+openSprints()+ORDER+BY+created+ASC&maxResults=120"