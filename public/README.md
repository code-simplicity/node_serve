# 部署说明

# MySQL Docker 容器导入 SQL 文件

好的，你可以通过 `docker exec` 命令，结合 MySQL 命令行客户端，将宿主机上的 `.sql` 文件导入到正在运行的 MySQL Docker 容器中。

最常用的方法是利用管道 (`|`) 将 `.sql` 文件的内容流式传输给容器内的 `mysql` 命令。

**假设：**

*   你的 MySQL Docker 容器名称或 ID 是: `[容器名或ID]` (例如 `app-mysql` 或 `d252f04e163e`)
*   你要导入的 `.sql` 文件位于**宿主机**的路径是: `[宿主机上sql文件的完整路径]` (例如 `/root/backups/my_backup.sql` 或 `./app_backup.sql`)
*   你用于连接 MySQL 的用户名是: `[mysql用户名]` (通常是 `root` 或你创建的其他用户)
*   对应的 MySQL 用户密码是: `[mysql密码]`
*   **(可选)** 你想将数据导入到特定的数据库中，数据库名为: `[目标数据库名]`

**步骤：**

1.  **找到容器名或 ID:**
    ```bash
    docker ps
    ```
    记下你的 MySQL 容器的 `CONTAINER ID` 或 `NAMES`。

2.  **执行导入命令:**
    在**宿主机**的终端中执行以下命令：

    *   **方法一：直接通过管道导入 (推荐)**

        ```bash
        cat [宿主机上sql文件的完整路径] | docker exec -i [容器名或ID] mysql -u [mysql用户名] -p'[mysql密码]' [目标数据库名]
        ```

        **说明:**
        *   `cat [宿主机上sql文件的完整路径]`: 读取宿主机上 `.sql` 文件的内容。
        *   `|`: 管道符，将 `cat` 命令的输出作为下一个命令的输入。
        *   `docker exec -i [容器名或ID]`: 在指定的容器内执行命令，`-i` 标志表示保持标准输入 (stdin) 打开，以便接收来自管道的数据。
        *   `mysql -u [mysql用户名] -p'[mysql密码]' [目标数据库名]`: 在容器内运行 MySQL 客户端。
            *   `-u`: 指定用户名。
            *   `-p'[mysql密码]'`: 指定密码。**注意：** `-p` 和密码之间**没有空格**。将 `[mysql密码]` 替换为你的真实密码，并用单引号括起来以防止特殊字符引起问题。**安全警告：** 在命令行直接写密码不安全，密码会留在命令历史中。
            *   `[目标数据库名]`: **可选参数**。指定要将 `.sql` 文件导入到哪个数据库。
                *   **如果你的 `.sql` 文件包含了 `CREATE DATABASE ...;` 和 `USE ...;` 语句**，你可以省略这个参数。
                *   **如果 `.sql` 文件只包含表结构和数据，没有指定数据库**，则**必须**提供这个参数，并且这个数据库需要**事先存在**于 MySQL 容器中。

    *   **方法二：使用交互式密码输入 (更安全)**

        ```bash
        cat [宿主机上sql文件的完整路径] | docker exec -i [容器名或ID] mysql -u [mysql用户名] -p [目标数据库名]
        ```
        *   和方法一类似，但 `-p` 后面**没有**跟密码。
        *   执行命令后，系统会提示你 `Enter password:`，这时你再输入密码按回车。密码不会显示在屏幕上，也不会留在命令历史中。

    *   **方法三：如果 `.sql` 文件是压缩的 (例如 `.sql.gz`)**

        ```bash
        # 假设文件是 backup.sql.gz
        cat [宿主机上sql文件的完整路径.gz] | gunzip | docker exec -i [容器名或ID] mysql -u [mysql用户名] -p [目标数据库名]
        # 或者 (交互式密码)
        # cat [宿主机上sql文件的完整路径.gz] | gunzip | docker exec -i [容器名或ID] mysql -u [mysql用户名] -p [目标数据库名]
        ```
        *   `gunzip`: 先解压 `.gz` 文件，然后将解压后的内容通过管道传给 `mysql` 命令。

**示例：**

假设：
*   容器名: `app-mysql`
*   SQL 文件路径: `/home/user/data/backup.sql`
*   MySQL 用户: `root`
*   MySQL 密码: `mysecretpassword`
*   目标数据库: `my_application_db` (假设此数据库已存在或 sql 文件会创建它)

```bash
# 使用直接密码 (不推荐用于生产环境)
cat /home/user/data/backup.sql | docker exec -i app-mysql mysql -u root -p'mysecretpassword' my_application_db

# 使用交互式密码 (推荐)
cat /home/user/data/backup.sql | docker exec -i app-mysql mysql -u root -p my_application_db

cat Dump20221011.sql | docker exec -i 3fb6d66fb39c mysql -u root -p'123456' design_project
# 然后输入密码: mysecretpassword
```

**重要注意事项：**

*   **文件路径：** 确保你提供的 `.sql` 文件路径是正确的**宿主机**路径。
*   **数据库存在性：** 如果你指定了 `[目标数据库名]`，请确保该数据库在 MySQL 容器中已经存在，除非你的 `.sql` 文件本身包含 `CREATE DATABASE IF NOT EXISTS [目标数据库名];` 这样的语句。
*   **权限：** 执行导入的 MySQL 用户 (`[mysql用户名]`) 需要有足够的权限来执行 `.sql` 文件中的所有操作（例如 `CREATE TABLE`, `INSERT`, `ALTER TABLE` 等）。`root` 用户通常拥有所有权限。
*   **字符集：** 确保 `.sql` 文件的字符集编码与你的 MySQL 数据库/表的预期编码一致，否则可能出现乱码。通常 UTF-8 (`utf8mb4`) 是推荐的选择。
*   **执行时间：** 导入大的 `.sql` 文件可能需要较长时间，请耐心等待命令执行完成。期间不要中断命令。
*   **错误处理：** 如果导入过程中出现 SQL 错误，错误信息通常会直接打印在终端上。仔细阅读错误信息以排查问题。

# 操作说明

# 使用说明

# 运行说明