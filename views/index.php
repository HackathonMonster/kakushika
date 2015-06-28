<!DOCTYPE html>
<html lang="ja">

<head>
	<meta charset="UTF-8">
	<title>KAKUSHIKA</title>
	<link rel="stylesheet" href="stylesheets/index.css">
	<script type="text/javascript">
		var $del = 0;

		function NextMonth(month) {
			++month;
		}

		function PrevMonth(month) {
			month = month - 1;
		}
	</script>
</head>

<body>
	<!--カレンダーと詳細表示合わせた部分のコンテナ-->
	<div class="container">
		<!--カレンダー部分-->
		<div class="calendar">
			<?php
			$Date_Data = date('Y-m-t');
			$Data = new DateTime($Date_Data);
			$Data->sub(new DateInterval('P4M'));
			$year = $Data->format('Y');
			$month = $Data->format('m');
			$date = $Data->format('t');
			?>

				<!--今日の日付-->
				<div class="Year_Month">
					<!--<input type="image" src="prev.png" class="prev_button"  onClick="PrevMonth($month)"/>-->
					<a href="JavaScript: PrevMonth($month)">
						<img src="images/prev.png" class="prev_button" />
					</a>
					<?php
				echo '<span>'.$year.'/'.$month.'</span>';
				?>
						<img src="images/next.png" class="next_button" onClick="NextMonth($month)" />
				</div>

				<!--曜日一覧-->
				<table class="day_common">
					<tr>
						<th class="right">
							<p class="sunday">S</p>
						</th>
						<th class="right">
							<p class="workday">M</p>
						</th>
						<th class="right">
							<p class="workday">T</p>
						</th>
						<th class="right">
							<p class="workday">W</p>
						</th>
						<th class="right">
							<p class="workday">T</p>
						</th>
						<th class="right">
							<p class="workday">F</p>
						</th>
						<th class="right_none">
							<p class="saturday">S</p>
						</th>
					</tr>
				</table>

				<table class="day_common2">
					<tr>
						<?php
				$first = $year."-".$month."-01";	//文字列として表示を行なう月の一日を格納する
				$dateTime = new DateTime($first);
				$w = (int)$dateTime->format('w');

				$last_Month_temp = $dateTime;
				$last_Month = $last_Month_temp->sub(new DateInterval('P1D'));
				$last_Date = $last_Month->format('t');		//先月の月末の日にち ex)31

				$i = $last_Date - ($w - 1);		//先月の月末がある週の日曜日の日付

				while($w){		//$w、つまり月の初日が日曜日の場合はこのループを飛ばす
					echo '<th class="last_next_month">'.$i.'</th>';
					if($i == $last_Date){ break;}
					$i++;
				}

				$j = 1;	//今月初めの日付

				while(1){
					echo '<th>'.$j.'</th>';
					$w++;
					if($w % 7 == 0) {
						echo '</tr></table><table class="day_common2"><tr>';
						}
						if($j == $date){ break;}
						$j++;
				}

				$k = 1;	//来月初めの日付

				while(1){
					echo '<th class="last_next_month">'.$k.'</th>';
					$w++;
					if($w % 7 == 0) {
						echo "</tr></table>";
						break;
					}
					$k++;
				}
				?>
		</div>
		<!--calendarクラス終了-->

		<div class="summary">
			<!--Slackからの情報をここで処理-->
			<p>Summaryが表示される部分</p>
			<p>Imageなどを張り付ける</p>
		</div>
		<!--summaryクラス終了-->

	</div>
</body>

</html>
