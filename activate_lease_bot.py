import json
import time
from web3 import Web3

# Kết nối với Ganache hoặc mạng khác
ganache_url = "http://127.0.0.1:8545"  # Địa chỉ của Ganache hoặc mạng khác
web3 = Web3(Web3.HTTPProvider(ganache_url))

# Kiểm tra kết nối
if web3.is_connected():
    print("Đã kết nối với Ganache.")
else:
    print("Không thể kết nối với Ganache.")
    exit()

# Địa chỉ hợp đồng và ABI
contract_address = "0x8C05cF87e46c0DA3F7F0507ee273B8323C4E1762"

# Đọc ABI từ file JSON
with open('build/contracts/TimeLimitedOwnership.json', encoding='utf-8') as f:
    contract_data = json.load(f)
    contract_abi = contract_data['abi']  # Lấy phần 'abi' từ file JSON

# Tạo đối tượng hợp đồng với ABI và địa chỉ
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# Kiểm tra số dư tài khoản của bot
bot_account = web3.eth.accounts[0]
balance = web3.eth.get_balance(bot_account)
print(f"Số dư tài khoản của bot: {balance} wei")

# Nếu số dư quá thấp, in cảnh báo
if balance == 0:
    print("Số dư tài khoản không đủ để thực hiện giao dịch")
    exit()



def check_and_activate_lease():
    total_tokens = contract.functions.totalSupply().call()
    print(f"Tổng số token: {total_tokens}")  # In ra tổng số token được mint

    # Kiểm tra thời gian hiện tại của block
    current_time = int(time.time())

    print(f"Thời gian hiện tại: {current_time}")

    for index in range(total_tokens):
        # Lấy token ID thực tế bằng cách sử dụng tokenByIndex
        try:
            token_id = contract.functions.tokenByIndex(index).call()
            print(f"Đang kiểm tra token ID: {token_id}")
        except Exception as e:
            print(f"Không thể lấy token ID tại index {index}: {e}")
            continue

        # Lấy thông tin lease của token ID
        try:
            lease = contract.functions.leasePeriods(token_id).call()
            print(f"Thông tin lease của token {token_id}: {lease}")

            # Truy cập các trường bằng chỉ số
            start_time = lease[0]  # startTime
            end_time = lease[1]    # endTime
            price_per_day = lease[2]  # pricePerDay
            renter = lease[3]  # renter

            print(f"Token {token_id}: startTime = {start_time}, endTime = {end_time}, current_time = {current_time}")
        except Exception as e:
            print(f"Không thể lấy thông tin về token {token_id}: {e}")
            continue  # Bỏ qua token này nếu có lỗi

        # Kích hoạt hợp đồng thuê nếu thời gian thuê đã bắt đầu nhưng chưa kết thúc
        if start_time <= current_time < end_time:
            print(f"Kích hoạt hợp đồng thuê cho token {token_id}")

            try:
                tx_hash = contract.functions.activateLease(token_id).transact({
                    'from': bot_account,  # Địa chỉ gửi giao dịch là bot
                    'gas': 2000000  # Thiết lập giới hạn gas
                })
                print(f"Giao dịch thành công với tx_hash: {tx_hash}")

                # Chờ receipt của giao dịch
                receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
                print(f"Receipt: {receipt}")
            except Exception as e:
                print(f"Lỗi khi kích hoạt hợp đồng thuê cho token {token_id}: {e}")
        
        # Tự động gọi reclaimToken nếu thời gian thuê đã kết thúc
        elif current_time > end_time:
            print(f"Thời gian thuê đã kết thúc cho token {token_id}, gọi reclaimToken")

            try:
                tx_hash = contract.functions.reclaimToken(token_id).transact({
                    'from': bot_account,  # Địa chỉ gửi giao dịch là bot
                    'gas': 2000000  # Thiết lập giới hạn gas
                })
                print(f"Giao dịch reclaimToken thành công với tx_hash: {tx_hash}")

                # Chờ receipt của giao dịch
                receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
                print(f"Receipt: {receipt}")
            except Exception as e:
                print(f"Lỗi khi gọi reclaimToken cho token {token_id}: {e}")


# Kiểm tra định kỳ và lắng nghe sự kiện
def main():
    while True:
        print("Kiểm tra hợp đồng thuê, kích hoạt nếu cần và reclaim nếu hết hạn...")
        check_and_activate_lease()
        time.sleep(20)  # Kiểm tra mỗi 10 giây

if __name__ == "__main__":
    main()
