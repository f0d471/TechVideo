`timescale 1ns/1ps
module tb_normalize_cases;
    reg clk = 0, rst_n = 0, in_valid = 0;
    reg [31:0] a = 0, b = 0;
    wire [31:0] p;
    wire out_valid;
    always #5 clk = ~clk;

    fp32_mul_pipe dut (
        .clk(clk), .rst_n(rst_n), .a(a), .b(b), .p(p),
        .in_valid(in_valid), .flush(1'b0), .out_valid(out_valid)
    );

    task automatic run_case(
        input [255:0] tag,
        input [31:0] ta, tb,
        input [47:0] expected_product, expected_normalized,
        input integer expected_exp_before, expected_exp_after,
        input expected_sticky, expected_round_up,
        input [31:0] expected_output
    );
        begin
            @(negedge clk);
            a = ta; b = tb; in_valid = 1;
            #1;
            if (dut.u_s1.product_s0 !== expected_product ||
                $signed(dut.u_s1.exp_sum_s0) != expected_exp_before)
                $fatal(1, "%0s: stage-1 product/exponent mismatch", tag);
            @(negedge clk);
            in_valid = 0;
            #1;
            if (!dut.u_s1.v_s1 || dut.u_s1.product_r !== expected_product ||
                $signed(dut.u_s1.exp_r) != expected_exp_before)
                $fatal(1, "%0s: stage-1 register mismatch", tag);
            if (dut.u_s2.prod_n !== expected_normalized ||
                $signed(dut.u_s2.exp_n_s) != expected_exp_after)
                $fatal(1, "%0s: normalized product/exponent mismatch", tag);
            if (dut.u_s2.sticky_bit !== expected_sticky ||
                dut.u_s2.round_up !== expected_round_up)
                $fatal(1, "%0s: downstream sticky/rounding mismatch", tag);
            $display("%0s a=%08h b=%08h product=%012h bit47=%b old_bit0=%b normalized=%012h exp=%0d->%0d sticky=%b round_up=%b",
                     tag, ta, tb, dut.u_s1.product_r, dut.u_s1.product_r[47],
                     dut.u_s1.product_r[0], dut.u_s2.prod_n,
                     $signed(dut.u_s1.exp_r), $signed(dut.u_s2.exp_n_s),
                     dut.u_s2.sticky_bit, dut.u_s2.round_up);
            @(negedge clk);
            if (!out_valid || p !== expected_output)
                $fatal(1, "%0s: final output mismatch, got %08h", tag, p);
            $display("  -> p=%08h out_valid=%b", p, out_valid);
        end
    endtask

    initial begin
        repeat (2) @(negedge clk);
        rst_n = 1;
        run_case("no_shift", 32'h3F800001, 32'h3FC00000,
                 48'h600000C00000, 48'h600000C00000,
                 127, 127, 1'b0, 1'b1, 32'h3FC00002);
        run_case("high_product", 32'h3FC00000, 32'h3FC00000,
                 48'h900000000000, 48'h480000000000,
                 127, 128, 1'b0, 1'b0, 32'h40100000);
        run_case("lost_bit", 32'h3FC00001, 32'h3FC00001,
                 48'h900001800001, 48'h480000C00001,
                 127, 128, 1'b1, 1'b1, 32'h40100002);
        run_case("lost_bit_changes_rounding", 32'h3F801001, 32'h3FFFF001,
                 48'h800800800001, 48'h400400400001,
                 127, 128, 1'b1, 1'b1, 32'h40000801);
        $display("all 4 normalization cases passed");
        $finish;
    end
endmodule
