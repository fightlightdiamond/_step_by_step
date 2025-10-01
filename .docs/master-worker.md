Để cho một node vừa là master vừa là worker, bạn cần xóa một "vết bẩn" (Taint) đặc biệt khỏi master node.

Trong các cụm Kubernetes nhiều node, các master node được "đánh dấu" để ngăn không cho các Pod ứng dụng thông thường chạy trên đó. Đây là một cơ chế an toàn để bảo vệ "bộ não" của cluster.

Tuy nhiên, trong môi trường tiết kiệm tài nguyên như Minikube, việc này đã được thực hiện mặc định. Node minikube duy nhất của bạn vừa chạy các thành phần control-plane (master) vừa chạy các Pod ứng dụng của bạn (worker). Bạn không cần làm gì cả.

## 💡 Cơ chế Taints và Tolerations
Để hiểu rõ hơn, bạn cần biết về khái niệm Taints (Vết bẩn) và Tolerations (Sự dung thứ).

Taint (Vết bẩn): Là một dấu hiệu được gán cho Node. Hãy coi nó như một tấm biển "Phòng VIP - Không phận sự miễn vào".

Toleration (Sự dung thứ): Là một thuộc tính được gán cho Pod. Hãy coi nó như một chiếc thẻ VIP cho phép vào phòng đó.

Mặc định, các master node có một Taint là NoSchedule, có nghĩa là "Đừng xếp lịch cho Pod nào không có thẻ VIP". Chỉ những Pod hệ thống quan trọng (có sẵn Toleration) mới được phép chạy trên đó.

## 🛡️ Cách cho phép Master Node chạy Pod (Xóa Taint)
Nếu bạn đang ở trong một cụm đa node và muốn master node cũng chạy Pod ứng dụng để tiết kiệm tài nguyên, bạn chỉ cần gỡ tấm biển "Không phận sự miễn vào" đó đi.

Bước 1: Tìm tên Taint trên master node

Chạy lệnh describe để xem chi tiết node và tìm dòng Taints.

Bash

# Thay <tên-master-node> bằng tên node của bạn
```angular2html
kubectl describe node <tên-master-node> | grep Taints
```
Bạn sẽ thấy một kết quả tương tự: Taints: node-role.kubernetes.io/control-plane:NoSchedule

Bước 2: Dùng lệnh kubectl taint để xóa

Sử dụng tên Taint bạn vừa tìm thấy và thêm một dấu - ở cuối để ra lệnh xóa.

```angular2html
kubectl taint nodes <tên-master-node> node-role.kubernetes.io/control-plane:NoSchedule-
```

kubectl taint nodes <tên-node>: Lệnh để quản lý Taint.

node-role.kubernetes.io/control-plane:NoSchedule: Tên của Taint cần xóa.

- (dấu trừ): Quan trọng nhất, có nghĩa là XÓA.

Sau khi chạy lệnh này, Kubernetes Scheduler sẽ coi master node như một worker node bình thường và có thể xếp lịch cho các Pod ứng dụng chạy trên đó.

## ⚠️ Khi nào nên làm việc này?
NÊN: Trong môi trường học tập, phát triển, hoặc các cụm cluster rất nhỏ với tài nguyên cực kỳ hạn chế và các ứng dụng không quan trọng.

KHÔNG NÊN: Tuyệt đối không nên làm trong môi trường Production. Nếu một Pod ứng dụng của bạn bị lỗi và chiếm hết CPU/RAM của master node, toàn bộ "bộ não" của cluster sẽ bị tê liệt, dẫn đến sập cả hệ thống.