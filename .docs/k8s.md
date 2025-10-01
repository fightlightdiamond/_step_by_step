6458  minikube start
6459  brew install minikube
6460  minikube start
6461  minikube status
6462  minikube node
6463  minikube node list
6464  minikube node add s1
6465  minikube node list
6466  kubectl get nodes
6467* kubectl config get-contexts
6468* kubectl cluster-info
6469  kubectl get nodes
6470  kubectl describe node minikube
6471  minikube addons enable metrics-server
6472  kubectl top node
6473  kubectl get pods -n kube-system
6474  kubectl top nodekubectl logs metrics-server-85b7d694d7-nf94l -n kube-system
6475  kubectl logs metrics-server-85b7d694d7-nf94l -n kube-system
6476  minikube stop
6477  minikube start
6478  kubectl get pods -n kube-system
6479  minikube delete
6480  minikube start
6481  minikube addons enable metrics-server
6482  kubectl get pods -n kube-system
6496  kubectl get nodes
6500  watch kubectl get nodes
6501  while true; do kubectl get nodes; sleep 2; clear; done
view pods: kubectl get pods
pod in Node: kubectl get pods -o wide
view detais pod: kubectl describe pod multi-container-pod