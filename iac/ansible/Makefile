project:
	ansible-playbook -i hosts.yml project.yml

renew-certificates:
	ansible-playbook -i hosts.yml renew-certificates.yml

generate-deploy-key:
	ssh-keygen -q -t rsa -N '' -f files/deploy_rsa

authorize-deploy:
	ansible-playbook -i hosts.yml authorize-deploy.yml

docker-login:
	ansible-playbook -i hosts.yml docker-login.yml

gitlab-runner:
	ansible-playbook -i hosts.yml gitlab-runner.yml
